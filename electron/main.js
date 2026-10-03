import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure user data directory is configured before any server module runs
const USER_DATA_PATH = path.join(app.getPath('userData'), 'TikFlowData');
process.env.TIKFLOW_DATA = USER_DATA_PATH;

import { startServer } from '../server/index.js';
import {
  createTransparentWindow,
  closeTransparentWindow,
  setClickThrough,
  getTransparentWindowStatus
} from './transparent-window.js';

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let serverInstance = null;
let activePort = 21420;

process.on('uncaughtException', (err) => {
  console.error('[Electron Uncaught Exception]:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Electron Unhandled Rejection]:', reason);
});

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1120,
    minHeight: 720,
    title: 'TikFlow – TikTok LIVE Otomasyon Merkezi',
    backgroundColor: '#0B0E1A',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow.loadURL(`http://localhost:${activePort}`);
    });
  } else {
    mainWindow.loadURL(`http://localhost:${activePort}`);
  }

  // Graceful reload if initial load occurred before express was completely bound
  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadURL(`http://localhost:${activePort}`);
      }
    }, 1200);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    const { server, port } = await startServer();
    serverInstance = server;
    activePort = port;
  } catch (err) {
    console.error('[Electron Main] Sunucu başlatılamadı:', err);
  }

  // Setup IPC Handlers
  ipcMain.handle('get-server-port', () => activePort);

  ipcMain.handle('open-transparent-overlay', () => {
    createTransparentWindow(activePort);
    return true;
  });

  ipcMain.handle('close-transparent-overlay', () => {
    return closeTransparentWindow();
  });

  ipcMain.handle('toggle-click-through', (_, enabled) => {
    return setClickThrough(enabled);
  });

  ipcMain.handle('get-transparent-status', () => {
    return getTransparentWindowStatus();
  });

  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
    }
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  await createWindow();

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', async () => {
  if (serverInstance) {
    try {
      serverInstance.close();
    } catch {}
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
