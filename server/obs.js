import { OBSWebSocket } from 'obs-websocket-js';

class ObsService {
  constructor() {
    this.obs = new OBSWebSocket();
    this.connected = false;
    this.connecting = false;
    this.config = {
      address: 'ws://127.0.0.1:4455',
      password: ''
    };
  }

  async connect(address, password) {
    if (this.connecting) return false;
    this.connecting = true;
    if (address) this.config.address = address;
    if (password !== undefined) this.config.password = password;

    try {
      await this.obs.connect(this.config.address, this.config.password);
      this.connected = true;
      this.connecting = false;
      console.log('[OBS] Connected to OBS Studio WebSocket');
      return true;
    } catch (err) {
      this.connected = false;
      this.connecting = false;
      console.warn('[OBS] Connection failed:', err.message);
      return false;
    }
  }

  async disconnect() {
    if (this.connected) {
      try {
        await this.obs.disconnect();
      } catch (e) {}
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected;
  }

  async switchScene(sceneName) {
    if (!this.connected) return false;
    try {
      await this.obs.call('SetCurrentProgramScene', { sceneName });
      return true;
    } catch (e) {
      console.warn('[OBS] Switch scene failed:', e.message);
      return false;
    }
  }

  async setSourceVisibility(sceneName, sceneItemId, visible) {
    if (!this.connected) return false;
    try {
      await this.obs.call('SetSceneItemEnabled', {
        sceneName,
        sceneItemId,
        sceneItemEnabled: visible
      });
      return true;
    } catch (e) {
      console.warn('[OBS] Set source visibility failed:', e.message);
      return false;
    }
  }
}

export const obsService = new ObsService();
export default obsService;
