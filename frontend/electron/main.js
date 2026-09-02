const { app, BrowserWindow, shell, Tray, Menu, nativeImage, protocol, net } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');

const isDev = !app.isPackaged;
const FRONTEND_URL = 'http://localhost:3000';
// Plain HTTP: the packaged backend only ever talks to this same app over
// loopback, and an end-user machine has no trusted cert for HTTPS anyway.
const BACKEND_URL  = 'http://localhost:7160';
const TRAY_ICON_PATH = path.join(__dirname, '..', 'public', 'icon.ico');
const HIDDEN_ARG = '--hidden';
const APP_SCHEME = 'app';

// when the OS launches the app at login (autostart), it's passed --hidden so it
// comes up minimized to the tray instead of popping a window on top of everything
const startedHidden = process.argv.includes(HIDDEN_ARG);

let backendProcess = null;
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

function configureAutoLaunch() {
    if (isDev) return; // don't register the dev binary as a login item

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
    const exePath = path.join(backendDir, 'GestioPro.Api.exe');
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
    backendProcess.on('error', err => console.error('[backend]', err));
}

function waitForBackend(url, retries = 30, delay = 1000) {
    return new Promise((resolve, reject) => {
        const check = (n) => {
            const req = http.get(url + '/api/v1/health', res => {
                if (res.statusCode < 500) resolve();
                else retry(n);
            });
            req.on('error', () => retry(n));
            req.setTimeout(800, () => { req.destroy(); retry(n); });
        };
        const retry = (n) => {
            if (n <= 0) return resolve(); // proceed anyway
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
        icon: path.join(__dirname, '..', 'public', 'icon.svg'),
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

function quitApp() {
    app.isQuitting = true;
    if (backendProcess) backendProcess.kill();
    app.quit();
}

// ── Tray ──────────────────────────────────────────────

function createTray() {
    const icon = nativeImage.createFromPath(TRAY_ICON_PATH);
    tray = new Tray(icon.isEmpty() ? icon : icon.resize({ width: 16, height: 16 }));
    tray.setToolTip('GestioPro');

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Apri', click: showWindow },
        { label: 'Esci', click: quitApp },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('double-click', showWindow);
}

// ── Lifecycle ─────────────────────────────────────────

app.whenReady().then(async () => {
    if (!isDev) registerAppProtocol();
    configureAutoLaunch();
    startBackend();
    if (!isDev) await waitForBackend(BACKEND_URL);
    createWindow(startedHidden);
    createTray();
});

app.on('window-all-closed', () => {
    // the window is hidden (not destroyed) on close, so this only fires
    // on platforms/paths where the window is actually torn down
    if (process.platform !== 'darwin') quitApp();
});

app.on('activate', () => {
    showWindow();
});

app.on('before-quit', () => {
    app.isQuitting = true;
});
