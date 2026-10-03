const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getServerPort: () => ipcRenderer.invoke('get-server-port'),
  openTransparentOverlay: () => ipcRenderer.invoke('open-transparent-overlay'),
  closeTransparentOverlay: () => ipcRenderer.invoke('close-transparent-overlay'),
  toggleClickThrough: (enabled) => ipcRenderer.invoke('toggle-click-through', enabled),
  getTransparentOverlayStatus: () => ipcRenderer.invoke('get-transparent-status'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close')
});
