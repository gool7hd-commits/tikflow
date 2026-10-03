import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { fileURLToPath } from 'url';

import db, { getDataDir } from './db.js';
import eventBus from './eventBus.js';
import ConflictQueueManager from './queue.js';
import AutomationEngine from './automationEngine.js';
import { createApiRouter } from './routes/api.js';
import { ensureDefaultSounds } from './soundGenerator.js';
import tikTokService, { setTikTokBroadcast } from './tiktok.js';
import { MEDIA_DIR, handleRangeStream } from './media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OVERLAY_DIR = path.join(ROOT_DIR, 'overlay');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Use writable DATA_DIR for generating default sound files (safe for ASAR packaged apps)
const DATA_DIR = getDataDir();
const SOUNDS_DIR = path.join(DATA_DIR, 'default-sounds');

try {
  ensureDefaultSounds(SOUNDS_DIR);
} catch (e) {
  console.warn('[Server] Could not initialize sounds directory:', e.message);
}

// Port finding helper
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await checkPortAvailable(port))) {
    console.warn(`[Port] Port ${port} is in use, trying ${port + 1}...`);
    port++;
    if (port > startPort + 50) {
      throw new Error('No available port found in range!');
    }
  }
  return port;
}

export async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws-overlay' });

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Overlay WebSocket Clients
  const overlayClients = new Set();

  function broadcastToOverlay(data) {
    const payload = JSON.stringify(data);
    for (const client of overlayClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  function getOverlayClientCount() {
    return overlayClients.size;
  }

  setTikTokBroadcast(broadcastToOverlay);

  wss.on('connection', (ws) => {
    overlayClients.add(ws);

    // Send initial configuration and state
    const activeProf = db.getActiveProfileId();
    const layout = db.getScreenLayout(activeProf);
    const settings = db.getSettings();
    const counters = db.getCounters();

    ws.send(JSON.stringify({
      type: 'overlay:init',
      layout,
      settings,
      counters,
      activeProfileId: activeProf
    }));

    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === 'overlay:request-layout') {
          ws.send(JSON.stringify({
            type: 'overlay:layout-update',
            layout: db.getScreenLayout(db.getActiveProfileId())
          }));
        }
      } catch (e) {}
    });

    ws.on('close', () => {
      overlayClients.delete(ws);
    });

    ws.on('error', () => {
      overlayClients.delete(ws);
    });
  });

  // Setup Queue Manager & Automation Engine
  const queueManager = new ConflictQueueManager((item) => {
    broadcastToOverlay(item);
  });
  const automationEngine = new AutomationEngine(queueManager);

  // Determine port
  const configuredPort = db.getSettings().port || 21420;
  const activePort = await findAvailablePort(configuredPort);
  if (activePort !== configuredPort) {
    db.updateSettings({ port: activePort });
  }

  // Mount API router
  app.use('/api', createApiRouter({
    queueManager,
    broadcastToOverlay,
    getOverlayClientCount,
    automationEngine,
    activePort
  }));

  // Tiktok status alias at root level – delegates to API router (no redirect loop)

  // Static Default Sounds (served from writable SOUNDS_DIR and fallback bundled dir)
  app.use('/default-sounds', express.static(SOUNDS_DIR));
  const fallbackSounds = path.join(ROOT_DIR, 'server/default-sounds');
  if (fs.existsSync(fallbackSounds)) {
    app.use('/default-sounds', express.static(fallbackSounds));
  }

  // Dedicated Media File Streaming with HTTP Range Header support for seamless OBS & browser video playback
  app.get(['/media/file/:filename', '/api/media/file/:filename'], (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(MEDIA_DIR, filename);
    handleRangeStream(req, res, filePath);
  });
  app.use('/media', express.static(MEDIA_DIR));

  // Overlay routes (supports /overlay, /overlay/:widget, and /w/:token/:widget matching LiveInteract)
  app.use('/overlay', express.static(OVERLAY_DIR));
  app.get(['/overlay', '/overlay/:widget', '/w/:token/:widget', '/mekansahibi', '/combomekansahibi', '/firework', '/topliker', '/w/:widget'], (req, res) => {
    res.sendFile(path.join(OVERLAY_DIR, 'index.html'));
  });

  // Production Frontend (Vite build)
  if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/overlay') || req.path.startsWith('/w/') || req.path.startsWith('/media') || req.path.startsWith('/default-sounds')) {
        return next();
      }
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  }

  // Track Top Liker and Mekan Sahibi
  const userLikes = new Map();
  let currentTopLiker = null;
  let lastMekanSahibiUsername = null;

  // Forward normalized events to overlay for realtime widgets
  eventBus.on('stream-event', (event) => {
    if (event.type === 'chat') {
      broadcastToOverlay({
        type: 'chat',
        user: event.user,
        comment: event.comment
      });
    } else if (event.type === 'like') {
      const added = event.likeCount || 1;
      const uId = event.user?.id || event.user?.username || 'anon';
      const cur = (userLikes.get(uId) || 0) + added;
      userLikes.set(uId, cur);

      if (!currentTopLiker || cur > currentTopLiker.likeCount) {
        currentTopLiker = {
          user: event.user,
          likeCount: cur
        };
        broadcastToOverlay({
          type: 'topliker:update',
          topLiker: currentTopLiker
        });
      }

      broadcastToOverlay({
        type: 'like',
        likeCount: event.likeCount,
        totalLikes: event.totalLikes
      });
    } else if (event.type === 'gift') {
      const counters = db.getCounters();
      broadcastToOverlay({
        type: 'counters-update',
        counters
      });

      // Firework effect on gifts
      broadcastToOverlay({
        type: 'firework',
        gift: event.gift
      });

      // Mekan Sahibi (Top 1 Gifter) & Combo Mekan Sahibi
      if (counters.topGifters && counters.topGifters[0]) {
        const top1 = counters.topGifters[0];
        const isNewMekan = !!(lastMekanSahibiUsername && lastMekanSahibiUsername !== top1.username);
        lastMekanSahibiUsername = top1.username;

        broadcastToOverlay({
          type: 'mekansahibi:update',
          mekanSahibi: top1
        });

        const isBigGift = (event.gift?.diamonds || 0) >= 300;
        const isStreak = (event.gift?.count || 1) >= 5;
        if (isNewMekan || isBigGift || isStreak) {
          broadcastToOverlay({
            type: 'combomekansahibi:update',
            comboMekanSahibi: {
              username: top1.username,
              nickname: top1.nickname,
              avatar: top1.avatar,
              diamonds: top1.diamonds,
              combo: event.gift?.count || 1,
              isNewMekan
            }
          });
        }
      }
    } else if (event.type === 'follow') {
      broadcastToOverlay({
        type: 'follow',
        user: event.user
      });
    }
  });

  return new Promise((resolve) => {
    server.listen(activePort, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 TikFlow LIVE Sunucusu Başlatıldı!`);
      console.log(`📍 Web Paneli: http://localhost:${activePort}`);
      console.log(`🎥 Overlay Linki: http://localhost:${activePort}/overlay`);
      console.log(`=======================================================`);

      // Auto-connect to TikTok username if configured (No 3rd party API needed)
      const currentSettings = db.getSettings();
      let startupUsername = currentSettings?.defaultUsername || '';
      if (!startupUsername) {
        try {
          const rawCfg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'config.json'), 'utf8'));
          if (rawCfg?.tiktok?.username) startupUsername = rawCfg.tiktok.username;
        } catch {}
      }

      if (startupUsername) {
        console.log(`[TikTok] Canlı yayına otomatik bağlanılıyor: @${startupUsername}`);
        tikTokService.connect(startupUsername).catch((err) => {
          console.warn('[TikTok AutoConnect]', err.message);
        });
      }

      resolve({ server, port: activePort, broadcastToOverlay });
    });
  });
}

// If executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

export default startServer;
