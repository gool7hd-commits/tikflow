import { TikTokLiveConnection } from 'tiktok-live-connector';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import eventBus from './eventBus.js';
import db from './db.js';
import { findGift } from '../shared/giftCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let liveConnection = null;
let retryTimer = null;

export const tiktokState = {
  connected: false,
  status: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'offline' | 'error'
  username: '',
  error: null,
  viewerCount: 0,
  roomInfo: null,
  reconnectAttempts: 0
};

// Global broadcast function set by server/index.js
let broadcastFn = null;
export function setTikTokBroadcast(fn) {
  broadcastFn = fn;
}

function broadcastStatus(msg) {
  if (broadcastFn) {
    broadcastFn({
      type: 'tiktokStatus',
      status: tiktokState.status,
      connected: tiktokState.connected,
      username: tiktokState.username,
      error: tiktokState.error,
      viewerCount: tiktokState.viewerCount,
      msg: msg || tiktokState.error || ''
    });
  }
}

export function formatTikTokError(err, username) {
  // Handle nested exception objects from v2 connector
  if (err?.exception) err = err.exception;

  // Try to extract a meaningful message from various error shapes
  let msg = '';
  if (typeof err === 'string') {
    msg = err;
  } else if (err?.message) {
    msg = err.message;
  } else if (err?.info) {
    msg = typeof err.info === 'string' ? err.info : JSON.stringify(err.info);
  } else if (err?.constructor?.name) {
    msg = err.constructor.name;
  } else {
    try { msg = JSON.stringify(err); } catch { msg = String(err); }
  }
  msg = msg.trim();

  const status = err?.response?.status || err?.statusCode || err?.status || null;

  if (/UserOfflineError|UserNotLiveError|isn't online|offline|LIVE has ended|HostNotOnlineError/i.test(msg) ||
      (err?.constructor?.name && /UserOfflineError/i.test(err.constructor.name))) {
    return `@${username} şu anda canlı yayında değil. Yayın açıldığında otomatik bağlanılacak.`;
  }
  if (/not found|exist|UserNotFoundError|ProfileNotFoundError|InvalidUniqueIdError/i.test(msg) || status === 404) {
    return `@${username} bulunamadı. Kullanıcı adını kontrol edin.`;
  }
  if (/block|rate.?limit|too many|forbidden|SignatureRateLimit/i.test(msg) || status === 429) {
    return 'TikTok rate limit engeli. VPN açın veya 5 dakika bekleyin.';
  }
  if (/timeout|network|fetch failed|econnrefused/i.test(msg)) {
    return 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
  }
  return msg || 'Bağlantı hatası oluştu.';
}

export async function disconnectTikTok() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  if (liveConnection) {
    try {
      liveConnection.removeAllListeners?.();
      await liveConnection.disconnect();
    } catch {}
    liveConnection = null;
  }
  tiktokState.connected = false;
  tiktokState.status = 'disconnected';
  tiktokState.error = null;
  broadcastStatus('Bağlantı kesildi');
}

export function extractTikTokUsername(input) {
  if (!input) return '';
  let str = String(input).trim();
  const match = str.match(/tiktok\.com\/@([a-zA-Z0-9_.-]+)/i);
  if (match) return match[1];
  return str.replace(/^@+/, '').split('?')[0].split('/')[0].trim();
}

export async function connectTikTok(rawUsername) {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  let defaultName = db.getSettings()?.defaultUsername || '';
  if (!defaultName) {
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'config.json'), 'utf8'));
      if (cfg?.tiktok?.username) defaultName = cfg.tiktok.username;
    } catch {}
  }

  const username = extractTikTokUsername(rawUsername || defaultName);
  if (!username) {
    tiktokState.status = 'error';
    tiktokState.error = 'Kullanıcı adı girilmedi';
    broadcastStatus('Kullanıcı adı girilmedi');
    return { ok: false, success: false, error: 'Kullanıcı adı girilmedi' };
  }

  if (liveConnection) {
    try {
      liveConnection.removeAllListeners?.();
      await liveConnection.disconnect();
    } catch {}
    liveConnection = null;
  }

  tiktokState.username = username;
  tiktokState.status = 'connecting';
  tiktokState.error = null;
  tiktokState.connected = false;

  // Save to database settings and sync to config.json
  db.updateSettings({ defaultUsername: username });
  try {
    const configPath = path.join(ROOT_DIR, 'config.json');
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (!cfg.tiktok) cfg.tiktok = {};
      cfg.tiktok.username = username;
      fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
    }
  } catch {}

  console.log(`[TikTok] @${username} yayınına bağlanılıyor...`);
  broadcastStatus(`@${username} yayınına bağlanılıyor...`);

  const settings = db.getSettings();
  const connOptions = {
    fetchRoomInfo: true,
    enableRequestPolling: true,
    requestPollingIntervalMs: 2000,
    webClientParams: {
      app_language: 'tr-TR',
      browser_language: 'tr'
    }
  };

  // Pass sign API key if configured (for euler/sign service)
  if (settings?.signApiKey) {
    connOptions.signApiKey = settings.signApiKey;
  }

  try {
    liveConnection = new TikTokLiveConnection(username, connOptions);
  } catch (initErr) {
    tiktokState.connected = false;
    tiktokState.status = 'error';
    tiktokState.error = initErr.message;
    broadcastStatus(initErr.message);
    throw initErr;
  }

  // ── Event Listeners (tiktok-live-connector v2 API) ──

  liveConnection.on('connected', (state) => {
    tiktokState.connected = true;
    tiktokState.status = 'connected';
    tiktokState.error = null;
    tiktokState.reconnectAttempts = 0;
    tiktokState.roomInfo = {
      roomId: state?.roomId || '',
      title: state?.roomInfo?.title || 'Canlı Yayın'
    };
    console.log(`[TikTok] Bağlandı: @${username}`);
    broadcastStatus(`@${username} yayınına bağlandı`);

    db.addHistory({
      type: 'system',
      ruleName: 'TikTok Bağlantısı',
      status: 'success',
      comment: `@${username} yayınına başarıyla bağlandı.`
    });
  });

  liveConnection.on('disconnected', () => {
    tiktokState.connected = false;
    tiktokState.status = 'disconnected';
    console.log(`[TikTok] Bağlantı kesildi: @${username}`);
    broadcastStatus('Bağlantı kesildi');
    scheduleTikTokRetry(username);
  });

  liveConnection.on('streamEnd', () => {
    tiktokState.connected = false;
    tiktokState.status = 'offline';
    tiktokState.error = `@${username} yayını sonlandırdı.`;
    console.log(`[TikTok] Yayın bitti: @${username}`);
    broadcastStatus(`@${username} yayını sonlandırdı.`);
    scheduleTikTokRetry(username);
  });

  liveConnection.on('error', (err) => {
    // v2 connector sends { info: string, exception: Error } objects
    const info = err?.info || '';
    const exMsg = err?.exception?.message || '';
    const msg = exMsg || info || (typeof err === 'string' ? err : '');

    if (!msg || /missing cursor/i.test(msg)) return;

    // Suppress "falling back" info messages that are not real errors
    if (/falling back|SIGI_STATE|blocked by TikTok/i.test(info) && !exMsg) return;

    tiktokState.error = formatTikTokError(err, username);
    console.error(`[TikTok Hata] ${exMsg || info}`);
    broadcastStatus(tiktokState.error);
  });

  // Gift listener – v2 event name: 'gift'
  liveConnection.on('gift', (data) => {
    try {
      const isStreakEnd = data.repeatEnd === 1 || data.repeatEnd === true || data.giftType === 1;
      const count = Number(data.repeatCount || data.repeat_count || 1);
      const coinCount = Number(
        data.diamondCount ||
        data.coinCount ||
        data.gift?.diamondCount ||
        data.gift?.coinCount ||
        data.extendedGiftInfo?.diamond_count ||
        1
      );

      const giftName = String(data.giftName || data.gift?.name || 'Hediye').trim();
      const catalogGift = findGift(giftName);
      const turkishName = catalogGift?.turkishName || giftName;
      const diamondsPerUnit = catalogGift?.diamonds || coinCount;
      const totalDiamonds = diamondsPerUnit * count;

      const event = {
        type: 'gift',
        user: {
          id: data.userId || data.uniqueId,
          username: data.uniqueId,
          nickname: data.nickname || data.uniqueId,
          avatar: data.profilePictureUrl || ''
        },
        gift: {
          id: data.giftId || catalogGift?.id || 1,
          name: giftName,
          turkishName: turkishName,
          diamonds: diamondsPerUnit,
          totalDiamonds: totalDiamonds,
          count: count,
          repeatEnd: isStreakEnd,
          icon: catalogGift?.icon || data.giftPictureUrl || ''
        },
        timestamp: new Date().toISOString(),
        isSimulation: false
      };

      eventBus.emitNormalized(event);
    } catch (e) {
      console.error('[Gift Error]', e.message);
    }
  });

  // Chat listener – v2 event name: 'chat'
  liveConnection.on('chat', (data) => {
    try {
      eventBus.emitNormalized({
        type: 'chat',
        user: {
          id: data.userId || data.uniqueId,
          username: data.uniqueId,
          nickname: data.nickname || data.uniqueId,
          avatar: data.profilePictureUrl || ''
        },
        comment: data.comment || '',
        timestamp: new Date().toISOString(),
        isSimulation: false
      });
    } catch (e) {
      console.error('[Chat Error]', e.message);
    }
  });

  // Like listener – v2 event name: 'like'
  liveConnection.on('like', (data) => {
    try {
      eventBus.emitNormalized({
        type: 'like',
        user: {
          id: data.userId || data.uniqueId,
          username: data.uniqueId,
          nickname: data.nickname || data.uniqueId,
          avatar: data.profilePictureUrl || ''
        },
        likeCount: Number(data.likeCount || 1),
        totalLikes: Number(data.totalLikeCount || 0),
        timestamp: new Date().toISOString(),
        isSimulation: false
      });
    } catch (e) {
      console.error('[Like Error]', e.message);
    }
  });

  // Follow listener – v2 event name: 'follow'
  liveConnection.on('follow', (data) => {
    try {
      eventBus.emitNormalized({
        type: 'follow',
        user: {
          id: data.userId || data.uniqueId,
          username: data.uniqueId,
          nickname: data.nickname || data.uniqueId,
          avatar: data.profilePictureUrl || ''
        },
        timestamp: new Date().toISOString(),
        isSimulation: false
      });
    } catch (e) {
      console.error('[Follow Error]', e.message);
    }
  });

  // Share listener – v2 event name: 'share'
  liveConnection.on('share', (data) => {
    try {
      eventBus.emitNormalized({
        type: 'share',
        user: {
          id: data.userId || data.uniqueId,
          username: data.uniqueId,
          nickname: data.nickname || data.uniqueId,
          avatar: data.profilePictureUrl || ''
        },
        timestamp: new Date().toISOString(),
        isSimulation: false
      });
    } catch (e) {
      console.error('[Share Error]', e.message);
    }
  });

  // Room user / viewer count – v2 event name: 'roomUser'
  liveConnection.on('roomUser', (data) => {
    const count = Number(data?.viewerCount ?? data?.total ?? data?.totalUser ?? 0);
    if (count > 0) {
      tiktokState.viewerCount = count;
      db.updateCounters({ liveViewers: count });
      broadcastStatus();
    }
  });

  try {
    const state = await liveConnection.connect();
    tiktokState.connected = true;
    tiktokState.status = 'connected';
    tiktokState.error = null;
    tiktokState.roomInfo = {
      roomId: state?.roomId || '',
      title: state?.roomInfo?.title || 'Canlı Yayın'
    };
    broadcastStatus(`@${username} yayınına bağlandı`);
    return { ok: true, success: true, connected: true, status: 'connected', username, roomId: state?.roomId };
  } catch (err) {
    tiktokState.connected = false;
    const formatted = formatTikTokError(err, username);
    const isOffline = /isn't online|offline|LIVE has ended|UserOfflineError/i.test(err?.message || '');
    tiktokState.status = isOffline ? 'offline' : 'error';
    tiktokState.error = formatted;
    console.log(`[TikTok] ${formatted}`);
    broadcastStatus(formatted);
    scheduleTikTokRetry(username);
    return {
      ok: true,
      success: true,
      connected: false,
      isOffline,
      status: tiktokState.status,
      username,
      error: formatted,
      message: isOffline
        ? `@${username} şu anda canlı yayında değil. Yayın açıldığında otomatik bağlanılacak.`
        : formatted
    };
  }
}

function scheduleTikTokRetry(username) {
  const settings = db.getSettings();
  if (settings?.retryOnError === false) return;
  const interval = 5000;
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    if (!tiktokState.connected && tiktokState.username) {
      console.log(`[TikTok] Yeniden bağlanma deneniyor (@${username})...`);
      connectTikTok(username).catch(() => null);
    }
  }, interval);
}

export const tikTokService = {
  getStatus: () => ({
    ...tiktokState,
    running: tiktokState.connected || tiktokState.status === 'connecting'
  }),
  connect: connectTikTok,
  disconnect: disconnectTikTok
};

export default tikTokService;
