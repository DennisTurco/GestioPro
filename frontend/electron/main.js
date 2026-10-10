const { app, BrowserWindow, shell, Tray, Menu, nativeImage, protocol, net, dialog } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');

const isDev = !app.isPackaged;
const FRONTEND_URL = 'http://localhost:3000';
// Plain HTTP: the packaged backend only ever talks to this same app over
// loopback, and an end-user machine has no trusted cert for HTTPS anyway.
const BACKEND_URL  = 'http://localhost:7160';
// .ico is only understood by Windows: Linux and macOS need a PNG
const APP_ICON_PATH = path.join(__dirname, '..', 'public', process.platform === 'win32' ? 'icon.ico' : 'icon.png');
const HIDDEN_ARG = '--hidden';
const APP_SCHEME = 'app';

// when the OS launches the app at login (autostart), it's passed --hidden so it
// comes up minimized to the tray instead of popping a window on top of everything.
// macOS login items don't receive command-line args: there the OS reports
// whether this launch came from the login item instead.
// (only queried once the app is ready)
function isStartedHidden() {
    return process.argv.includes(HIDDEN_ARG) ||
        (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAtLogin);
}

let backendProcess = null;
let backendExitInfo = null; // set if the backend process exits before we stop waiting on it
let mainWindow = null;
let tray = null;
app.isQuitting = false;

// Loading dist/index.html directly via file:// (loadFile/loadURL with a file:
// URL) breaks relative asset resolution for anything served out of an .asar
// archive - Chromium's own file:// resolver doesn't understand asar virtual
// paths and relative requests end up pointed at the filesystem root instead
// of the app's dist folder. Serving the build through a custom scheme avoids
// that entirely and is the approach Electron's own docs recommend for this.
protocol.registerSchemesAsPrivileged([
    { scheme: APP_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

function registerAppProtocol() {
    const distDir = path.join(__dirname, '..', 'dist');
    protocol.handle(APP_SCHEME, (request) => {
        const { pathname } = new URL(request.url);
        const relativePath = pathname === '/' || pathname === '' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
        const filePath = path.join(distDir, relativePath);
        return net.fetch(pathToFileURL(filePath).toString());
    });
}

// ── Autostart ─────────────────────────────────────────

// Electron's login item API is Windows/macOS only: on Linux, desktops follow
// the XDG autostart spec, i.e. a .desktop file in ~/.config/autostart.
function configureLinuxAutoLaunch() {
    const configHome = process.env.XDG_CONFIG_HOME || path.join(app.getPath('home'), '.config');
    const file = path.join(configHome, 'autostart', 'gestiopro.desktop');

    // Inside an AppImage, execPath points into a temporary mount that changes
    // every run: APPIMAGE is the path of the .AppImage file itself. Packaged
    // builds run as "<name>.bin" behind the sandbox-detecting launcher script
    // (build/after-pack.cjs): autostart goes through the launcher too.
    const exec = process.env.APPIMAGE || process.execPath.replace(/\.bin$/, '');
    const entry = [
        '[Desktop Entry]',
        'Type=Application',
        'Name=GestioPro',
        `Exec="${exec}" ${HIDDEN_ARG}`,
        'Terminal=false',
        'X-GNOME-Autostart-enabled=true',
        '',
    ].join('\n');

    try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, entry);
    } catch (err) {
        console.error('[electron] autostart', err);
    }
}

function configureAutoLaunch() {
    if (isDev) return; // don't register the dev binary as a login item

    if (process.platform === 'linux') {
        configureLinuxAutoLaunch();
        return;
    }

    app.setLoginItemSettings({
        openAtLogin: true,
        args: [HIDDEN_ARG],
    });
}

// ── Backend ───────────────────────────────────────────

function startBackend() {
    if (isDev) {
        console.log('[electron] dev mode — expecting backend already running');
        return;
    }

    const backendDir = path.join(process.resourcesPath, 'backend');
    const exePath = path.join(backendDir, process.platform === 'win32' ? 'GestioPro.Api.exe' : 'GestioPro.Api');
    backendProcess = spawn(exePath, [], {
        cwd: backendDir, // ASP.NET Core loads appsettings.json relative to the
                          // working directory, which otherwise defaults to
                          // Electron's own cwd, not the backend's folder
        detached: false,
        stdio: 'ignore',
        env: {
            ...process.env,
            ASPNETCORE_ENVIRONMENT: 'Production',
            ASPNETCORE_URLS: BACKEND_URL,
        },
    });
    backendProcess.on('error', err => { backendExitInfo = String(err); console.error('[backend]', err); });
    backendProcess.on('exit', (code, signal) => {
        if (!app.isQuitting) backendExitInfo = `exited early (code ${code}, signal ${signal})`;
    });
}

// Resolves true once the backend answers /api/v1/health, false if it never
// did within the retry budget (backend missing a dependency, crashed on
// startup, blocked by antivirus/firewall, etc.) - the caller decides what to
// tell the user rather than silently pretending everything is fine.
function waitForBackend(url, retries = 30, delay = 1000) {
    return new Promise((resolve) => {
        const check = (n) => {
            const req = http.get(url + '/api/v1/health', res => {
                if (res.statusCode < 500) resolve(true);
                else retry(n);
            });
            req.on('error', () => retry(n));
            req.setTimeout(800, () => { req.destroy(); retry(n); });
        };
        const retry = (n) => {
            if (n <= 0) return resolve(false);
            setTimeout(() => check(n - 1), delay);
        };
        check(retries);
    });
}

// ── Window ────────────────────────────────────────────

function createWindow(startHidden = false) {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'GestioPro',
        icon: APP_ICON_PATH,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
        autoHideMenuBar: true,
        backgroundColor: '#0F172A',
        show: false,
    });

    if (isDev) {
        mainWindow.loadURL(FRONTEND_URL);
    } else {
        mainWindow.loadURL(`${APP_SCHEME}://index.html`);
    }

    // avoid a flash of the window when launched hidden (autostart) or in the background
    mainWindow.once('ready-to-show', () => {
        if (!startHidden) mainWindow.show();
    });

    // Electron's built-in "Zoom In" accelerator is bound to Ctrl+Plus, which on most
    // keyboards is actually Ctrl+Shift+= - pressing plain Ctrl+= (what people actually
    // reach for) doesn't match, so it silently does nothing while Ctrl+- (zoom out,
    // no shift ambiguity) works fine. Handle all zoom keys explicitly instead.
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type !== 'keyDown' || !input.control || input.meta) return;
        const wc = mainWindow.webContents;
        if (input.key === '=' || input.key === '+') {
            wc.setZoomLevel(Math.min(wc.getZoomLevel() + 0.5, 5));
            event.preventDefault();
        } else if (input.key === '-') {
            wc.setZoomLevel(Math.max(wc.getZoomLevel() - 0.5, -5));
            event.preventDefault();
        } else if (input.key === '0') {
            wc.setZoomLevel(0);
            event.preventDefault();
        }
    });

    // open external links in the system browser, not in the app
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // clicking the window's close button hides it to the tray instead of quitting
    mainWindow.on('close', (event) => {
        if (app.isQuitting) return;
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('closed', () => { mainWindow = null; });
}

function showWindow() {
    if (!mainWindow) {
        createWindow();
        return;
    }
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
}

// macOS keeps an app in the Dock for as long as it runs, even with every
// window hidden: show the Dock icon only while the window is visible, so the
// app looks tray-only while it runs in the background, like on Windows.
function updateDockVisibility() {
    if (process.platform !== 'darwin') return;

    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) app.dock.show();
    else app.dock.hide();
}

app.on('browser-window-created', (_event, win) => {
    win.on('show', updateDockVisibility);
    win.on('hide', updateDockVisibility);
    win.on('closed', updateDockVisibility);
});

function quitApp() {
    app.isQuitting = true;
    if (backendProcess) backendProcess.kill();
    app.quit();
}

// ── Tray ──────────────────────────────────────────────

function getTrayImage() {
    const source = nativeImage.createFromPath(APP_ICON_PATH);
    if (source.isEmpty()) return source;
    if (process.platform !== 'darwin') return source.resize({ width: 16, height: 16 });

    // The macOS menu bar shows tray images at their pixel size: shrink to the
    // standard 18pt height, with a 2x representation for Retina displays.
    const image = nativeImage.createEmpty();
    for (const scaleFactor of [1, 2]) {
        const resized = source.resize({ height: 18 * scaleFactor, quality: 'best' });
        image.addRepresentation({ scaleFactor, buffer: resized.toPNG() });
    }
    return image;
}

function createTray() {
    tray = new Tray(getTrayImage());
    tray.setToolTip('GestioPro');

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Apri', click: showWindow },
        { label: 'Esci', click: quitApp },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('double-click', showWindow);
    // Linux tray implementations don't emit double-click
    if (process.platform === 'linux') tray.on('click', showWindow);
}

// ── Lifecycle ─────────────────────────────────────────

app.whenReady().then(async () => {
    if (!isDev) registerAppProtocol();
    configureAutoLaunch();
    startBackend();

    if (!isDev) {
        const backendReady = await waitForBackend(BACKEND_URL);
        if (!backendReady) {
            dialog.showErrorBox(
                'GestioPro',
                'Il servizio in background non ha risposto in tempo.\n\n' +
                (backendExitInfo ? `Dettagli: ${backendExitInfo}\n\n` : '') +
                'Prova a riavviare l\'app. Se il problema persiste, controlla che l\'antivirus non stia bloccando GestioPro.exe o GestioPro.Api.exe.'
            );
        }
    }

    createWindow(isStartedHidden());
    createTray();
    // Started hidden (login item): no "show" event will fire, hide the Dock icon now
    updateDockVisibility();
});

app.on('window-all-closed', () => {
    // the window is hidden (not destroyed) on close, so this only fires
    // on platforms/paths where the window is actually torn down
    if (process.platform !== 'darwin') quitApp();
});

app.on('activate', () => {
    showWindow();
});

// also covers quitting from outside the tray menu (Cmd+Q on macOS, logout/shutdown)
app.on('before-quit', () => {
    app.isQuitting = true;
    if (backendProcess) backendProcess.kill();
});
