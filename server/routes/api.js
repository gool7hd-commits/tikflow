import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import eventBus from '../eventBus.js';
import tikTokService from '../tiktok.js';
import { obsService } from '../obs.js';
import { TIKTOK_GIFTS, findGift } from '../../shared/giftCatalog.js';
import { detectMediaType, getMimeType, handleRangeStream, MEDIA_DIR } from '../media.js';

export function createApiRouter({ queueManager, broadcastToOverlay, getOverlayClientCount, automationEngine, activePort }) {
  const router = express.Router();

  // Multer config for media uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, MEDIA_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
      cb(null, `${safeName}_${Date.now()}${ext}`);
    }
  });
  const upload = multer({ storage });

  // System & Status
  router.get('/status', (req, res) => {
    const tt = tikTokService.getStatus();
    const obs = obsService.isConnected();
    const overlayClients = getOverlayClientCount();
    const activeProfileId = db.getActiveProfileId();
    const counters = db.getCounters();
    const settings = db.getSettings();

    res.json({
      port: activePort,
      tiktok: tt,
      obsConnected: obs,
      overlayClientCount: overlayClients,
      activeProfileId,
      counters,
      settings
    });
  });

  // Dedicated TikTok Status (as requested in uploaded files)
  router.get('/tiktok/status', (req, res) => {
    res.json(tikTokService.getStatus());
  });

  // TikTok Controls (both /tiktok/connect and /connect)
  const handleConnect = async (req, res) => {
    try {
      const username = req.body.username;
      const result = await tikTokService.connect(username);
      res.json({ ok: true, success: true, ...result });
    } catch (err) {
      res.status(400).json({ ok: false, success: false, error: err.message });
    }
  };

  const handleDisconnect = async (req, res) => {
    try {
      await tikTokService.disconnect(true);
      res.json({ ok: true, success: true });
    } catch (err) {
      res.status(500).json({ ok: false, success: false, error: err.message });
    }
  };

  router.post('/tiktok/connect', handleConnect);
  router.post('/connect', handleConnect);
  router.post('/tiktok/disconnect', handleDisconnect);
  router.post('/disconnect', handleDisconnect);

  // Profiles
  router.get('/profiles', (req, res) => {
    res.json({
      profiles: db.getProfiles(),
      activeProfileId: db.getActiveProfileId()
    });
  });

  router.post('/profiles', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Profil adı gerekli' });
    const profile = db.createProfile(name);
    res.json(profile);
  });

  router.post('/profiles/:id/select', (req, res) => {
    const ok = db.setActiveProfile(req.params.id);
    if (ok) {
      // notify overlay about layout update for new profile
      const layout = db.getScreenLayout(req.params.id);
      broadcastToOverlay({ type: 'overlay:layout-update', layout });
      res.json({ success: true, activeProfileId: req.params.id });
    } else {
      res.status(404).json({ error: 'Profil bulunamadı' });
    }
  });

  router.post('/profiles/:id/duplicate', (req, res) => {
    const { name } = req.body;
    const cloned = db.duplicateProfile(req.params.id, name);
    if (cloned) res.json(cloned);
    else res.status(404).json({ error: 'Profil bulunamadı' });
  });

  router.delete('/profiles/:id', (req, res) => {
    const ok = db.deleteProfile(req.params.id);
    if (ok) res.json({ success: true });
    else res.status(400).json({ error: 'Varsayılan profil silinemez veya bulunamadı' });
  });

  // Automations
  router.get('/automations', (req, res) => {
    const profileId = req.query.profileId || db.getActiveProfileId();
    res.json(db.getAutomations(profileId));
  });

  router.post('/automations', (req, res) => {
    const item = db.addAutomation(req.body);
    automationEngine.setupTimers();
    res.json(item);
  });

  router.put('/automations/:id', (req, res) => {
    const updated = db.updateAutomation(req.params.id, req.body);
    if (updated) {
      automationEngine.setupTimers();
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Otomasyon bulunamadı' });
    }
  });

  router.delete('/automations/:id', (req, res) => {
    const ok = db.deleteAutomation(req.params.id);
    if (ok) {
      automationEngine.setupTimers();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Otomasyon bulunamadı' });
    }
  });

  router.post('/automations/:id/duplicate', (req, res) => {
    const cloned = db.duplicateAutomation(req.params.id);
    if (cloned) res.json(cloned);
    else res.status(404).json({ error: 'Otomasyon bulunamadı' });
  });

  router.post('/automations/:id/toggle', (req, res) => {
    const autos = db.getAllAutomations();
    const auto = autos.find(a => a.id === req.params.id);
    if (auto) {
      const updated = db.updateAutomation(req.params.id, { aktif: !auto.aktif });
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Otomasyon bulunamadı' });
    }
  });

  router.post('/automations/toggle-all', (req, res) => {
    const { enable } = req.body;
    const list = db.toggleAllAutomations(enable);
    res.json(list);
  });

  // Reusable Actions Management (Matching LiveInteract "Yeni Eylem")
  router.get('/actions', (req, res) => {
    res.json(db.getActions());
  });

  router.post('/actions', (req, res) => {
    const saved = db.saveAction(req.body);
    res.json(saved);
  });

  router.delete('/actions/:id', (req, res) => {
    const result = db.deleteAction(req.params.id);
    res.json({ success: result });
  });

  router.post('/automations/:id/test', (req, res) => {
    const autos = db.getAllAutomations();
    const auto = autos.find(a => a.id === req.params.id);
    if (!auto) return res.status(404).json({ error: 'Otomasyon bulunamadı' });

    // Synthesize an event matching this automation's trigger
    const simulatedEvent = {
      type: auto.tetikleyici?.type === 'timer' ? 'timer' : (auto.tetikleyici?.type || 'gift'),
      user: {
        id: 'test-user',
        username: 'test_yayinci',
        nickname: 'Test Yayinci 👑',
        avatar: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
      },
      gift: {
        id: 6059,
        name: auto.tetikleyici?.config?.giftName || 'Lion',
        turkishName: auto.tetikleyici?.config?.turkishName || 'Aslan',
        diamonds: auto.tetikleyici?.config?.minDiamonds || 29999,
        count: auto.tetikleyici?.config?.minCount || 1,
        repeatEnd: true,
        icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
      },
      comment: auto.tetikleyici?.config?.keyword || 'Harika yayın! KORKU',
      likeCount: 1000,
      totalLikes: 5000,
      timestamp: new Date().toISOString(),
      isSimulation: true
    };

    automationEngine.executeAutomation(auto, simulatedEvent);
    res.json({ success: true, message: 'Test olayı tetiklendi' });
  });

  // Overlay Layout & Canvas Editor
  router.get('/overlay/layout', (req, res) => {
    const profileId = req.query.profileId || db.getActiveProfileId();
    res.json(db.getScreenLayout(profileId));
  });

  router.post('/overlay/layout', (req, res) => {
    const profileId = req.body.profileId || db.getActiveProfileId();
    const layout = db.saveScreenLayout(req.body.layout, profileId);
    // Instant live sync to overlay!
    broadcastToOverlay({ type: 'overlay:layout-update', layout });
    res.json({ success: true, layout });
  });

  router.post('/overlay/test', (req, res) => {
    // Send a real instant test alert to overlay with optional custom animation and text
    const { animation, text, subText, combo, giftIcon, userAvatar, duration } = req.body || {};
    const testData = {
      type: 'alert',
      conflictMode: 'interrupt',
      durationSec: Number(duration) || 6,
      text: text || '🦁 Test_Kullanici ASLAN Gönderdi x1!',
      subText: subText || 'TikFlow Canlı Overlay Testi Başarılı!',
      animation: animation || 'zoom',
      repeatCount: Number(combo) || 1,
      userAvatar: userAvatar || 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png',
      giftIcon: giftIcon || 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
    };
    broadcastToOverlay(testData);
    res.json({ success: true, message: 'Overlay test sinyali gönderildi', testData });
  });

  router.post('/overlay/test-media', (req, res) => {
    const { mediaUrl, duration, volume, animation } = req.body;
    if (!mediaUrl) return res.status(400).json({ error: 'Medya URL bulunamadı' });
    const item = {
      type: 'media',
      conflictMode: 'interrupt',
      mediaUrl,
      durationSec: Number(duration) || 6,
      volume: volume !== undefined ? Number(volume) : 100,
      animation: animation || 'fade',
      location: 'center'
    };
    broadcastToOverlay(item);
    res.json({ success: true, message: 'Edit videosu overlaye iletildi' });
  });

  // Dedicated LiveInteract Widget Test Endpoints
  router.post('/overlay/test-mekansahibi', (req, res) => {
    const { username, nickname, diamonds, avatar } = req.body || {};
    const data = {
      username: username || 'kral_destekci',
      nickname: nickname || '👑 Altın Sultan 👑',
      diamonds: Number(diamonds) || 150000,
      avatar: avatar || 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
    };
    broadcastToOverlay({ type: 'mekansahibi:update', mekanSahibi: data });
    res.json({ success: true, message: 'Mekan Sahibi rozeti güncellendi', data });
  });

  router.post('/overlay/test-combomekansahibi', (req, res) => {
    const { username, nickname, diamonds, combo, avatar, isNewMekan } = req.body || {};
    const data = {
      username: username || 'efsane_destekci',
      nickname: nickname || '🦁 Aslan Kral 🦁',
      diamonds: Number(diamonds) || 29999,
      combo: Number(combo) || 10,
      avatar: avatar || 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png',
      isNewMekan: isNewMekan !== undefined ? isNewMekan : true
    };
    broadcastToOverlay({ type: 'combomekansahibi:update', comboMekanSahibi: data });
    res.json({ success: true, message: 'Kombo Mekan Sahibi 3D kutlaması tetiklendi', data });
  });

  router.post('/overlay/test-topliker', (req, res) => {
    const { username, nickname, likeCount, avatar } = req.body || {};
    const data = {
      user: {
        username: username || 'beğeni_şampiyonu',
        nickname: nickname || '❤️ Hızlı Parmak ❤️',
        avatar: avatar || 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
      },
      likeCount: Number(likeCount) || 12500
    };
    broadcastToOverlay({ type: 'topliker:update', topLiker: data });
    res.json({ success: true, message: 'Top Liker rozeti güncellendi', data });
  });

  router.post('/overlay/test-firework', (req, res) => {
    broadcastToOverlay({ type: 'firework' });
    res.json({ success: true, message: '3D Havai fişek şöleni patlatıldı' });
  });

  // Media Management
  router.get('/media', (req, res) => {
    res.json(db.getMediaList());
  });

  router.post('/media/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    const type = detectMediaType(req.file.path);
    const mediaItem = {
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      path: req.file.path,
      relativeUrl: `/media/file/${req.file.filename}`,
      type: type,
      size: req.file.size,
      mimeType: req.file.mimetype,
      duration: Number(req.body.duration) || 5
    };

    const saved = db.addMedia(mediaItem);
    res.json(saved);
  });

  router.delete('/media/:id', (req, res) => {
    const result = db.deleteMedia(req.params.id);
    res.json(result);
  });

  // Bind or Update TikTok Gift automation for a media item
  router.post('/media/:id/bind-gift', (req, res) => {
    const media = db.getMediaList().find((m) => m.id === req.params.id);
    if (!media) return res.status(404).json({ error: 'Medya bulunamadı' });

    const { giftName, turkishName, diamonds, count, onlyStreakEnd, duration, volume, alertTitle } = req.body;
    const activeProf = db.getActiveProfileId();

    // Check if an automation already references this media in the active profile
    let existingAuto = db.getAutomations(activeProf).find((a) =>
      a.aksiyonlar?.some((act) => act.mediaUrl === media.relativeUrl || act.mediaId === media.id)
    );

    const isAllGifts = giftName === 'ALL' || giftName === '*';
    const isDiamondRange = !isAllGifts && diamonds && !giftName;

    const triggerConfig = {
      matchType: isAllGifts ? 'any' : (isDiamondRange ? 'diamonds' : 'specific'),
      giftName: isAllGifts ? '' : (giftName || ''),
      turkishName: isAllGifts ? '' : (turkishName || giftName || ''),
      minDiamonds: Number(diamonds) || 0,
      minCount: Number(count) || 1,
      onlyStreakEnd: Boolean(onlyStreakEnd)
    };

    const mediaAction = {
      id: 'act-media-' + Date.now(),
      type: 'media',
      mediaId: media.id,
      mediaUrl: media.relativeUrl,
      duration: Number(duration) || media.duration || 6,
      volume: volume !== undefined ? Number(volume) : 100,
      animation: 'fade',
      location: 'center'
    };

    const actions = [mediaAction];
    if (alertTitle !== false) {
      actions.push({
        id: 'act-alert-' + (Date.now() + 1),
        type: 'alert',
        text: alertTitle || `🎉 {kullanici} {hediye} gönderdi!`,
        subText: 'Özel Edit Yayında!',
        duration: Number(duration) || media.duration || 6,
        animation: 'zoom'
      });
    }

    const autoTitle = `${media.name} (${turkishName || giftName || (isAllGifts ? 'Tüm Hediyeler' : 'Hediye')})`;

    if (existingAuto) {
      const updated = db.updateAutomation(existingAuto.id, {
        ad: autoTitle,
        aktif: true,
        conflictMode: 'queue',
        cooldownSec: 1,
        tetikleyici: {
          type: 'gift',
          config: triggerConfig
        },
        aksiyonlar: actions
      });
      return res.json({ success: true, automation: updated, isNew: false });
    } else {
      const created = db.addAutomation({
        ad: autoTitle,
        aktif: true,
        profileId: activeProf,
        conflictMode: 'queue',
        cooldownSec: 1,
        tetikleyici: {
          type: 'gift',
          config: triggerConfig
        },
        aksiyonlar: actions
      });
      return res.json({ success: true, automation: created, isNew: true });
    }
  });

  router.get('/media/check', (req, res) => {
    const check = db.checkMissingMedia();
    res.json(check);
  });

  // Serve media files with Range header
  router.get('/media/file/:filename', (req, res) => {
    const filePath = path.join(MEDIA_DIR, req.params.filename);
    handleRangeStream(req, res, filePath);
  });

  // Gifts Catalog
  router.get('/gifts', (req, res) => {
    const { search, category, minDiamonds, maxDiamonds } = req.query;
    let gifts = [...TIKTOK_GIFTS];

    if (search) {
      const q = search.toLowerCase();
      gifts = gifts.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.turkishName.toLowerCase().includes(q) ||
        String(g.diamonds).includes(q)
      );
    }

    if (category && category !== 'Tümü') {
      gifts = gifts.filter(g => g.category === category);
    }

    if (minDiamonds) {
      gifts = gifts.filter(g => g.diamonds >= Number(minDiamonds));
    }

    if (maxDiamonds) {
      gifts = gifts.filter(g => g.diamonds <= Number(maxDiamonds));
    }

    // Attach active automations indicator
    const automations = db.getAutomations();
    const mapped = gifts.map(g => {
      const linkedAuto = automations.find(a => {
        if (!a.aktif) return false;
        if (a.tetikleyici?.type !== 'gift') return false;
        const cfg = a.tetikleyici.config;
        if (cfg?.matchType === 'specific') {
          return (cfg.giftName?.toLowerCase() === g.name.toLowerCase() ||
                  cfg.turkishName?.toLowerCase() === g.turkishName.toLowerCase());
        }
        return false;
      });
      return {
        ...g,
        hasAutomation: !!linkedAuto,
        automationName: linkedAuto?.ad || null
      };
    });

    res.json(mapped);
  });

  // Simulator / Quick Test
  router.post('/simulator/trigger', (req, res) => {
    const { type, user, gift, comment, likeCount } = req.body;

    const normalized = {
      type: type || 'gift',
      user: {
        id: user?.id || 'sim-user',
        username: user?.username || 'izleyici_canli',
        nickname: user?.nickname || user?.username || 'İzleyici Dostu 🌟',
        avatar: user?.avatar || 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
      },
      gift: gift ? {
        id: gift.id || 6059,
        name: gift.name || 'Lion',
        turkishName: gift.turkishName || 'Aslan',
        diamonds: gift.diamonds || 29999,
        totalDiamonds: (gift.diamonds || 29999) * (gift.count || 1),
        count: gift.count || 1,
        repeatEnd: true,
        icon: gift.icon || 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
      } : null,
      comment: comment || '',
      likeCount: likeCount || 1,
      totalLikes: (db.getCounters().totalLikes || 0) + (likeCount || 1),
      timestamp: new Date().toISOString(),
      isSimulation: true
    };

    // Send through true event bus
    eventBus.emitNormalized(normalized);

    // Also send direct chat stream or counter update to overlay if type is chat or like
    if (type === 'chat') {
      broadcastToOverlay({
        type: 'chat',
        user: normalized.user,
        comment: normalized.comment
      });
    } else if (type === 'like') {
      broadcastToOverlay({
        type: 'like',
        likeCount: normalized.likeCount,
        totalLikes: normalized.totalLikes
      });
    } else if (type === 'follow') {
      broadcastToOverlay({
        type: 'follow',
        user: normalized.user
      });
    }

    res.json({ success: true, normalized });
  });

  // History
  router.get('/history', (req, res) => {
    const limit = Number(req.query.limit) || 200;
    res.json(db.getHistory(limit));
  });

  router.delete('/history', (req, res) => {
    db.clearHistory();
    res.json({ success: true });
  });

  router.get('/history/csv', (req, res) => {
    const items = db.getHistory(1000);
    let csv = 'Zaman,Olay Tipi,Kullanıcı,Hediye,Jeton,Adet,Yorum,Kural,Durum\n';
    items.forEach(i => {
      const time = i.timestamp || '';
      const type = i.type || '';
      const user = (i.user?.nickname || i.user?.username || '').replace(/"/g, '""');
      const gift = (i.gift?.turkishName || i.gift?.name || '').replace(/"/g, '""');
      const diamonds = i.gift?.diamonds || '';
      const count = i.gift?.count || '';
      const comment = (i.comment || '').replace(/"/g, '""');
      const rule = (i.ruleName || '').replace(/"/g, '""');
      const status = i.status || '';
      csv += `"${time}","${type}","${user}","${gift}","${diamonds}","${count}","${comment}","${rule}","${status}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="tikflow_gecmis.csv"');
    res.send('\uFEFF' + csv);
  });

  // Settings
  router.get('/settings', (req, res) => {
    res.json(db.getSettings());
  });

  router.post('/settings', (req, res) => {
    const updated = db.updateSettings(req.body);
    broadcastToOverlay({ type: 'overlay:settings-update', settings: updated });
    res.json(updated);
  });

  router.post('/settings/backup', (req, res) => {
    const jsonStr = db.exportAll();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="tikflow_yedek.json"');
    res.send(jsonStr);
  });

  router.post('/settings/restore', (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Veri gerekli' });
    const result = db.importAll(typeof data === 'string' ? data : JSON.stringify(data));
    res.json(result);
  });

  // Conflict Queue
  router.get('/queue', (req, res) => {
    res.json(queueManager.getQueueStatus());
  });

  router.post('/queue/clear', (req, res) => {
    queueManager.clearQueue();
    res.json({ success: true, message: 'Kuyruk temizlendi' });
  });

  // OBS WebSocket
  router.post('/obs/connect', async (req, res) => {
    const { address, password } = req.body;
    const ok = await obsService.connect(address, password);
    res.json({ success: ok, connected: obsService.isConnected() });
  });

  router.post('/obs/disconnect', async (req, res) => {
    await obsService.disconnect();
    res.json({ success: true, connected: false });
  });

  router.get('/obs/status', (req, res) => {
    res.json({ connected: obsService.isConnected() });
  });

  return router;
}

export default createApiRouter;
