const { app, BrowserWindow, shell, Tray, Menu, nativeImage } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const isDev = !app.isPackaged;
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL  = 'https://localhost:7160';
const TRAY_ICON_PATH = path.join(__dirname, '..', 'public', 'icon.ico');
const HIDDEN_ARG = '--hidden';

// when the OS launches the app at login (autostart), it's passed --hidden so it
// comes up minimized to the tray instead of popping a window on top of everything
const startedHidden = process.argv.includes(HIDDEN_ARG);

let backendProcess = null;
let mainWindow = null;
let tray = null;
app.isQuitting = false;

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

    const exePath = path.join(process.resourcesPath, 'backend', 'GestioPro.Api.exe');
    backendProcess = spawn(exePath, [], { detached: false, stdio: 'ignore' });
    backendProcess.on('error', err => console.error('[backend]', err));
}

function waitForBackend(url, retries = 30, delay = 1000) {
    return new Promise((resolve, reject) => {
        const check = (n) => {
            const req = http.get(url.replace('https', 'http') + '/api/v1/health', res => {
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
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
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
