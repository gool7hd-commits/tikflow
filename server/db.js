import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDataDir() {
  if (process.env.TIKFLOW_DATA) return process.env.TIKFLOW_DATA;
  if (process.env.APPDATA) return path.join(process.env.APPDATA, 'TikFlowData');
  return path.resolve(__dirname, '../data');
}

const DATA_DIR = getDataDir();
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial database structure
const DEFAULT_WIDGETS = [
  {
    id: 'widget-video',
    type: 'videoPlayer',
    name: 'Video / Edit Oynatıcı',
    enabled: true,
    x: 40,
    y: 400,
    width: 1000,
    height: 1000,
    zIndex: 10,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-alert',
    type: 'alertBox',
    name: 'Uyarı Kutusu (Hediyeler & Olaylar)',
    enabled: true,
    x: 90,
    y: 120,
    width: 900,
    height: 220,
    zIndex: 20,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-chat',
    type: 'chatStream',
    name: 'Canlı Sohbet Akışı',
    enabled: true,
    x: 60,
    y: 1420,
    width: 480,
    height: 440,
    zIndex: 15,
    opacity: 95,
    rotation: 0
  },
  {
    id: 'widget-goal',
    type: 'goalBar',
    name: 'Hedef Çubuğu',
    enabled: true,
    x: 90,
    y: 35,
    width: 900,
    height: 65,
    zIndex: 15,
    opacity: 100,
    rotation: 0,
    goalType: 'diamond',
    goalTarget: 1000,
    goalCurrent: 0,
    goalTitle: 'Günün Hediyesi: Aslan!'
  },
  {
    id: 'widget-counters',
    type: 'counters',
    name: 'Beğeni & Jeton Sayaçları',
    enabled: true,
    x: 560,
    y: 1720,
    width: 460,
    height: 140,
    zIndex: 15,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-leaderboard',
    type: 'leaderboard',
    name: 'Hediye Lider Tablosu (Top 5)',
    enabled: true,
    x: 640,
    y: 1380,
    width: 380,
    height: 320,
    zIndex: 15,
    opacity: 95,
    rotation: 0
  },
  {
    id: 'widget-ticker',
    type: 'ticker',
    name: 'Son Takipçi & Son Hediye',
    enabled: true,
    x: 60,
    y: 1870,
    width: 960,
    height: 40,
    zIndex: 15,
    opacity: 90,
    rotation: 0
  },
  {
    id: 'widget-viewers',
    type: 'viewerCount',
    name: 'Canlı İzleyici Sayacı',
    enabled: true,
    x: 820,
    y: 110,
    width: 200,
    height: 50,
    zIndex: 18,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-custom',
    type: 'customText',
    name: 'Özel Metin / Yayıncı Etiketi',
    enabled: false,
    x: 100,
    y: 100,
    width: 300,
    height: 60,
    zIndex: 5,
    opacity: 100,
    rotation: 0,
    customText: 'TikFlow TikTok LIVE'
  },
  {
    id: 'widget-anger-meter',
    type: 'angerMeter',
    name: 'Anger Meter (Öfke Metresi)',
    enabled: false,
    x: 220,
    y: 850,
    width: 640,
    height: 150,
    zIndex: 15,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-principal-office',
    type: 'gameDoodle',
    name: 'Principal Unc Office',
    enabled: false,
    x: 220,
    y: 1050,
    width: 640,
    height: 400,
    zIndex: 15,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-win-counter-1',
    type: 'winCounter',
    name: "Win Counter (Timmy's Tower)",
    enabled: false,
    x: 60,
    y: 900,
    width: 300,
    height: 172,
    zIndex: 15,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-round-timer',
    type: 'roundTimer',
    name: 'Round Timer (Tur Sayacı)',
    enabled: false,
    x: 380,
    y: 700,
    width: 320,
    height: 320,
    zIndex: 15,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-win-counter-2',
    type: 'winCounter',
    name: 'Win Counter (Holy Steps)',
    enabled: false,
    x: 720,
    y: 900,
    width: 300,
    height: 172,
    zIndex: 15,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-team-wins',
    type: 'teamWins',
    name: 'Team Wins (Takım Skorları)',
    enabled: false,
    x: 330,
    y: 600,
    width: 420,
    height: 180,
    zIndex: 15,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-save-timer',
    type: 'saveTimer',
    name: 'Save Timer (Gül Kurtarma Sayacı)',
    enabled: false,
    x: 90,
    y: 1100,
    width: 900,
    height: 300,
    zIndex: 15,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-mekansahibi',
    type: 'mekansahibi',
    name: '👑 Mekan Sahibi Rozeti (VIP Throne)',
    enabled: true,
    x: 60,
    y: 80,
    width: 380,
    height: 100,
    zIndex: 25,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-combomekansahibi',
    type: 'combomekansahibi',
    name: '🔥 Kombo Mekan Sahibi (3D Kutlama Kartı)',
    enabled: true,
    x: 60,
    y: 200,
    width: 480,
    height: 130,
    zIndex: 35,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-topliker',
    type: 'topliker',
    name: '❤️ Top Liker Rozeti (En Çok Beğenen)',
    enabled: true,
    x: 60,
    y: 350,
    width: 320,
    height: 90,
    zIndex: 22,
    opacity: 100,
    rotation: 0
  },
  {
    id: 'widget-firework',
    type: 'firework',
    name: '🎆 3D Havai Fişek & Konfeti Yağmuru',
    enabled: true,
    x: 0,
    y: 0,
    width: 1080,
    height: 1920,
    zIndex: 40,
    opacity: 100,
    rotation: 0
  }
];

const DEFAULT_AUTOMATIONS = [
  {
    id: 'auto-lion',
    profileId: 'default',
    ad: 'Aslan Hediyesinde Krallık Kutlaması',
    aktif: true,
    tetikleyici: {
      type: 'gift',
      config: {
        giftName: 'Lion',
        turkishName: 'Aslan',
        minDiamonds: 0,
        minCount: 1,
        matchType: 'specific'
      }
    },
    aksiyonlar: [
      {
        id: 'act-1',
        type: 'alert',
        text: '🦁 {kullanici} ASLAN GÖNDERDİ! TEŞEKKÜRLER!',
        subText: '{jeton} Jeton Değerinde Muazzam Destek!',
        duration: 8,
        animation: 'zoom'
      },
      {
        id: 'act-2',
        type: 'sound',
        soundUrl: '/default-sounds/tada.wav',
        volume: 90
      }
    ],
    conflictMode: 'interrupt',
    cooldownSec: 2,
    userLimitSec: 0,
    multiplier: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'auto-rose',
    profileId: 'default',
    ad: 'Gül Hediyesi - Teşekkür',
    aktif: true,
    tetikleyici: {
      type: 'gift',
      config: {
        giftName: 'Rose',
        turkishName: 'Gül',
        minDiamonds: 1,
        minCount: 1,
        matchType: 'specific'
      }
    },
    aksiyonlar: [
      {
        id: 'act-1',
        type: 'alert',
        text: '🌹 {kullanici} Gül gönderdi x{adet}!',
        subText: 'Desteklerin için teşekkürler!',
        duration: 4,
        animation: 'bounce'
      },
      {
        id: 'act-2',
        type: 'sound',
        soundUrl: '/default-sounds/pop.wav',
        volume: 70
      }
    ],
    conflictMode: 'queue',
    cooldownSec: 0,
    userLimitSec: 0,
    multiplier: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'auto-galaxy',
    profileId: 'default',
    ad: 'Galaksi Hediyesi - Uzay Animasyonu',
    aktif: true,
    tetikleyici: {
      type: 'gift',
      config: {
        giftName: 'Galaxy',
        turkishName: 'Galaksi',
        minDiamonds: 1000,
        minCount: 1,
        matchType: 'specific'
      }
    },
    aksiyonlar: [
      {
        id: 'act-1',
        type: 'alert',
        text: '🌌 {kullanici} GALAKSİ GÖNDERDİ!',
        subText: '1000 Jetonluk Yıldız Yağmuru!',
        duration: 6,
        animation: 'shake'
      },
      {
        id: 'act-2',
        type: 'sound',
        soundUrl: '/default-sounds/bell.wav',
        volume: 85
      }
    ],
    conflictMode: 'queue',
    cooldownSec: 1,
    userLimitSec: 0,
    multiplier: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'auto-follow',
    profileId: 'default',
    ad: 'Yeni Takipçi Karşılama',
    aktif: true,
    tetikleyici: {
      type: 'follow',
      config: {}
    },
    aksiyonlar: [
      {
        id: 'act-1',
        type: 'alert',
        text: '👋 {kullanici} Ailemize Katıldı! (Takip)',
        subText: 'Hoş geldin!',
        duration: 3,
        animation: 'slide'
      }
    ],
    conflictMode: 'queue',
    cooldownSec: 1,
    userLimitSec: 0,
    multiplier: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'auto-korku-chat',
    profileId: 'default',
    ad: 'Chatte KORKU Yazılınca Ses Efekti',
    aktif: true,
    tetikleyici: {
      type: 'comment',
      config: {
        keyword: 'KORKU',
        matchType: 'contains',
        caseSensitive: false
      }
    },
    aksiyonlar: [
      {
        id: 'act-1',
        type: 'alert',
        text: '😱 {kullanici}: "{yorum}"',
        subText: 'Korku modu tetiklendi!',
        duration: 3,
        animation: 'shake'
      },
      {
        id: 'act-2',
        type: 'sound',
        soundUrl: '/default-sounds/laser.wav',
        volume: 80
      }
    ],
    conflictMode: 'multi',
    cooldownSec: 5,
    userLimitSec: 10,
    multiplier: false,
    createdAt: new Date().toISOString()
  }
];

class Database {
  constructor() {
    this.ensureDirs();
    this.data = this.load();
  }

  ensureDirs() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const mediaDir = path.join(DATA_DIR, 'media');
      if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
      }
    } catch (e) {
      console.warn('[DB] ensureDirs warning:', e.message);
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return this.mergeWithDefaults(parsed);
      }
    } catch (err) {
      console.error('[DB] Load error, using defaults:', err.message);
    }
    const fresh = this.getDefaults();
    this.saveDirect(fresh);
    return fresh;
  }

  getDefaults() {
    return {
      settings: {
        port: 21420,
        layout: 'vertical',
        defaultVolume: 80,
        ttsEnabled: true,
        ttsVoice: 'tr-TR',
        ttsRate: 1.0,
        autoConnectOnStart: false,
        defaultUsername: '',
        signApiKey: '',
        copyMedia: true,
        theme: 'dark'
      },
      profiles: [
        { id: 'default', name: 'Normal Yayın', isDefault: true, createdAt: new Date().toISOString() },
        { id: 'gaming', name: 'Oyun Yayını', isDefault: false, createdAt: new Date().toISOString() },
        { id: 'pk', name: 'Sohbet / PK', isDefault: false, createdAt: new Date().toISOString() }
      ],
      activeProfileId: 'default',
      automations: DEFAULT_AUTOMATIONS,
      media: [],
      screenLayouts: {
        default: DEFAULT_WIDGETS,
        gaming: DEFAULT_WIDGETS.map((w) => ({ ...w })),
        pk: DEFAULT_WIDGETS.map((w) => ({ ...w }))
      },
      history: [],
      counters: {
        totalLikes: 0,
        totalDiamonds: 0,
        followerCount: 0,
        topGifters: [],
        lastFollower: null,
        lastGifter: null,
        liveViewers: 0
      }
    };
  }

  mergeWithDefaults(data) {
    const defaults = this.getDefaults();
    return {
      settings: { ...defaults.settings, ...(data.settings || {}) },
      profiles: data.profiles && data.profiles.length > 0 ? data.profiles : defaults.profiles,
      activeProfileId: data.activeProfileId || 'default',
      automations: data.automations || defaults.automations,
      media: data.media || [],
      screenLayouts: {
        default: data.screenLayouts?.default || defaults.screenLayouts.default,
        gaming: data.screenLayouts?.gaming || defaults.screenLayouts.gaming,
        pk: data.screenLayouts?.pk || defaults.screenLayouts.pk,
        ...(data.screenLayouts || {})
      },
      history: data.history || [],
      counters: { ...defaults.counters, ...(data.counters || {}) }
    };
  }

  save() {
    this.saveDirect(this.data);
  }

  saveDirect(obj) {
    try {
      this.ensureDirs();
      const tempPath = DB_FILE + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(obj, null, 2), 'utf8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Save error:', err.message);
    }
  }

  getSettings() {
    return this.data.settings;
  }

  updateSettings(partial) {
    this.data.settings = { ...this.data.settings, ...partial };
    this.save();
    return this.data.settings;
  }

  getProfiles() {
    return this.data.profiles;
  }

  getActiveProfileId() {
    return this.data.activeProfileId || 'default';
  }

  setActiveProfile(id) {
    if (this.data.profiles.some((p) => p.id === id)) {
      this.data.activeProfileId = id;
      if (!this.data.screenLayouts[id]) {
        this.data.screenLayouts[id] = DEFAULT_WIDGETS.map((w) => ({ ...w }));
      }
      this.save();
      return true;
    }
    return false;
  }

  createProfile(name) {
    const id = 'prof-' + Date.now();
    const newProf = { id, name, isDefault: false, createdAt: new Date().toISOString() };
    this.data.profiles.push(newProf);
    this.data.screenLayouts[id] = DEFAULT_WIDGETS.map((w) => ({ ...w }));
    this.save();
    return newProf;
  }

  deleteProfile(id) {
    if (id === 'default' || this.data.profiles.length <= 1) return false;
    this.data.profiles = this.data.profiles.filter((p) => p.id !== id);
    if (this.data.activeProfileId === id) {
      this.data.activeProfileId = this.data.profiles[0].id;
    }
    delete this.data.screenLayouts[id];
    this.data.automations = this.data.automations.filter((a) => a.profileId !== id);
    this.save();
    return true;
  }

  duplicateProfile(id, newName) {
    const source = this.data.profiles.find((p) => p.id === id);
    if (!source) return null;
    const newId = 'prof-' + Date.now();
    const cloned = {
      id: newId,
      name: newName || `${source.name} (Kopya)`,
      isDefault: false,
      createdAt: new Date().toISOString()
    };
    this.data.profiles.push(cloned);
    const existingLayout = this.data.screenLayouts[id] || DEFAULT_WIDGETS;
    this.data.screenLayouts[newId] = JSON.parse(JSON.stringify(existingLayout));
    const existingAutos = this.data.automations.filter((a) => a.profileId === id);
    existingAutos.forEach((a) => {
      this.data.automations.push({
        ...JSON.parse(JSON.stringify(a)),
        id: 'auto-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        profileId: newId
      });
    });
    this.save();
    return cloned;
  }

  getAutomations(profileId) {
    const prof = profileId || this.getActiveProfileId();
    return this.data.automations.filter((a) => a.profileId === prof);
  }

  getAllAutomations() {
    return this.data.automations;
  }

  addAutomation(automation) {
    const item = {
      ...automation,
      id: automation.id || 'auto-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      profileId: automation.profileId || this.getActiveProfileId(),
      createdAt: new Date().toISOString()
    };
    this.data.automations.push(item);
    this.save();
    return item;
  }

  updateAutomation(id, updates) {
    const idx = this.data.automations.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.data.automations[idx] = { ...this.data.automations[idx], ...updates };
      this.save();
      return this.data.automations[idx];
    }
    return null;
  }

  deleteAutomation(id) {
    const initialLen = this.data.automations.length;
    this.data.automations = this.data.automations.filter((a) => a.id !== id);
    if (this.data.automations.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  duplicateAutomation(id) {
    const source = this.data.automations.find((a) => a.id === id);
    if (!source) return null;
    const cloned = {
      ...JSON.parse(JSON.stringify(source)),
      id: 'auto-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      ad: `${source.ad} (Kopya)`,
      createdAt: new Date().toISOString()
    };
    this.data.automations.push(cloned);
    this.save();
    return cloned;
  }

  toggleAllAutomations(enable) {
    const activeProf = this.getActiveProfileId();
    this.data.automations.forEach((a) => {
      if (a.profileId === activeProf) {
        a.aktif = !!enable;
      }
    });
    this.save();
    return this.getAutomations(activeProf);
  }

  getScreenLayout(profileId) {
    const prof = profileId || this.getActiveProfileId();
    return this.data.screenLayouts[prof] || DEFAULT_WIDGETS;
  }

  saveScreenLayout(layout, profileId) {
    const prof = profileId || this.getActiveProfileId();
    this.data.screenLayouts[prof] = layout;
    this.save();
    return layout;
  }

  getActions() {
    this.data.actions = this.data.actions || [];
    return this.data.actions;
  }

  saveAction(action) {
    this.data.actions = this.data.actions || [];
    const idx = this.data.actions.findIndex((a) => a.id === action.id);
    if (idx !== -1) {
      this.data.actions[idx] = { ...this.data.actions[idx], ...action };
      this.save();
      return this.data.actions[idx];
    } else {
      const item = {
        ...action,
        id: action.id || 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)
      };
      this.data.actions.push(item);
      this.save();
      return item;
    }
  }

  deleteAction(id) {
    this.data.actions = this.data.actions || [];
    this.data.actions = this.data.actions.filter((a) => a.id !== id);
    this.save();
    return true;
  }

  getMediaList() {
    return this.data.media;
  }

  addMedia(mediaItem) {
    const item = {
      ...mediaItem,
      id: mediaItem.id || 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      addedAt: new Date().toISOString()
    };
    this.data.media.unshift(item);
    this.save();
    return item;
  }

  deleteMedia(id) {
    const item = this.data.media.find((m) => m.id === id);
    if (!item) return { success: false, inUse: false };

    const inUse = this.data.automations.some((a) =>
      a.aksiyonlar?.some(
        (act) => act.mediaId === id || act.mediaUrl?.includes(id) || act.fileUrl?.includes(id)
      )
    );

    this.data.media = this.data.media.filter((m) => m.id !== id);
    if (item.path && fs.existsSync(item.path)) {
      try {
        fs.unlinkSync(item.path);
      } catch (e) {
        console.error('[DB] Failed to remove file:', e.message);
      }
    }
    this.save();
    return { success: true, inUse };
  }

  checkMissingMedia() {
    const results = [];
    for (const item of this.data.media) {
      const exists = item.path ? fs.existsSync(item.path) : false;
      const inUseCount = this.data.automations.filter((a) =>
        a.aksiyonlar?.some(
          (act) => act.mediaId === item.id || act.mediaUrl?.includes(item.id) || act.fileUrl?.includes(item.id)
        )
      ).length;

      results.push({
        ...item,
        exists,
        inUseCount
      });
    }
    return results;
  }

  getHistory(limit = 200) {
    return this.data.history.slice(0, limit);
  }

  addHistory(entry) {
    const item = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.data.history.unshift(item);
    if (this.data.history.length > 500) {
      this.data.history = this.data.history.slice(0, 500);
    }
    this.save();
    return item;
  }

  clearHistory() {
    this.data.history = [];
    this.save();
    return true;
  }

  getCounters() {
    return this.data.counters;
  }

  updateCounters(delta) {
    if (delta.likes) this.data.counters.totalLikes = (this.data.counters.totalLikes || 0) + delta.likes;
    if (delta.diamonds) this.data.counters.totalDiamonds = (this.data.counters.totalDiamonds || 0) + delta.diamonds;
    if (delta.follower) {
      this.data.counters.followerCount = (this.data.counters.followerCount || 0) + 1;
      this.data.counters.lastFollower = delta.follower;
    }
    if (delta.gifter) {
      this.data.counters.lastGifter = delta.gifter;
      const existing = this.data.counters.topGifters.find((g) => g.username === delta.gifter.username);
      if (existing) {
        existing.diamonds += delta.diamonds || 0;
        existing.avatar = delta.gifter.avatar || existing.avatar;
      } else {
        this.data.counters.topGifters.push({
          username: delta.gifter.username,
          nickname: delta.gifter.nickname || delta.gifter.username,
          avatar: delta.gifter.avatar || '',
          diamonds: delta.diamonds || 0
        });
      }
      this.data.counters.topGifters.sort((a, b) => b.diamonds - a.diamonds);
      this.data.counters.topGifters = this.data.counters.topGifters.slice(0, 10);
    }
    if (typeof delta.liveViewers === 'number') {
      this.data.counters.liveViewers = delta.liveViewers;
    }
    this.save();
    return this.data.counters;
  }

  resetCounters() {
    this.data.counters = {
      totalLikes: 0,
      totalDiamonds: 0,
      followerCount: 0,
      topGifters: [],
      lastFollower: null,
      lastGifter: null,
      liveViewers: 0
    };
    this.save();
    return this.data.counters;
  }

  exportAll() {
    return JSON.stringify(this.data, null, 2);
  }

  importAll(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this.data = this.mergeWithDefaults(parsed);
      this.save();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

export const db = new Database();
export default db;
