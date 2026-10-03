import { BrowserWindow, screen } from 'electron';
import path from 'path';

let transparentWindow = null;
let isClickThrough = false;

export function createTransparentWindow(port) {
  if (transparentWindow && !transparentWindow.isDestroyed()) {
    transparentWindow.focus();
    return transparentWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  transparentWindow = new BrowserWindow({
    width: Math.min(1080, Math.floor(width * 0.8)),
    height: Math.min(1920, height),
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const overlayUrl = `http://localhost:${port}/overlay`;
  transparentWindow.loadURL(overlayUrl);

  transparentWindow.on('closed', () => {
    transparentWindow = null;
    isClickThrough = false;
  });

  return transparentWindow;
}

export function closeTransparentWindow() {
  if (transparentWindow && !transparentWindow.isDestroyed()) {
    transparentWindow.close();
    transparentWindow = null;
    isClickThrough = false;
    return true;
  }
  return false;
}

export function setClickThrough(enable) {
  isClickThrough = !!enable;
  if (transparentWindow && !transparentWindow.isDestroyed()) {
    transparentWindow.setIgnoreMouseEvents(isClickThrough, { forward: true });
    return true;
  }
  return false;
}

export function getTransparentWindowStatus() {
  return {
    isOpen: transparentWindow !== null && !transparentWindow.isDestroyed(),
    isClickThrough
  };
}
