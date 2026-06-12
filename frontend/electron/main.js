const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const isDev = !app.isPackaged;
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL  = 'https://localhost:7160';

let backendProcess = null;
let mainWindow = null;

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

function createWindow() {
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
    });

    if (isDev) {
        mainWindow.loadURL(FRONTEND_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    // open external links in the system browser, not in the app
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => { mainWindow = null; });
}

// ── Lifecycle ─────────────────────────────────────────

app.whenReady().then(async () => {
    startBackend();
    if (!isDev) await waitForBackend(BACKEND_URL);
    createWindow();
});

app.on('window-all-closed', () => {
    if (backendProcess) backendProcess.kill();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
