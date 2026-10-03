import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import {
  MonitorPlay,
  Save,
  Play,
  Copy,
  ExternalLink,
  Tv,
  Layers,
  Move,
  Maximize2,
  Eye,
  EyeOff,
  Grid,
  CheckCircle2,
  Info,
  RotateCw,
  Sliders,
  Search,
  X,
  Settings,
  Flame,
  Plus,
  Trash2,
  Sparkles,
  Gamepad2,
  Target,
  Bell,
  Users,
  BarChart3,
  Type,
  Radio,
  Code,
  Palette,
  Wand2
} from 'lucide-react';

export const ANIMATION_SHOWCASE = [
  { id: 'neon-pulse', label: '🌟 Neon Parlama', icon: '🌟', badge: 'Glow' },
  { id: 'flip-3d', label: '🔄 3D Kart Flip', icon: '🔄', badge: '3D' },
  { id: 'elastic', label: '⚡ Elastik Pop', icon: '⚡', badge: 'Bounce' },
  { id: 'fire-burst', label: '🔥 Alev Patlaması', icon: '🔥', badge: 'Inferno' },
  { id: 'rainbow', label: '🌈 Gökkuşağı', icon: '🌈', badge: 'Holo' },
  { id: 'glitch', label: '👾 Siber Glitch', icon: '👾', badge: 'Cyber' },
  { id: 'heartbeat', label: '💓 Kalp Atışı', icon: '💓', badge: 'Pulse' },
  { id: 'swirl', label: '🌪️ Girdap', icon: '🌪️', badge: 'Vortex' },
  { id: 'tada', label: '🎉 Coşkulu Tada', icon: '🎉', badge: 'Fanfare' },
  { id: 'rubberband', label: '🎯 Lastik Gerilme', icon: '🎯', badge: 'Elastic' }
];

export const CSS_PRESETS = [
  {
    name: '🌟 Süper Neon Parlama',
    code: `/* Özel Neon Parlama Efekti */
@keyframes mySuperNeon {
  0% { transform: scale(0.6); filter: drop-shadow(0 0 30px #06b6d4); }
  50% { transform: scale(1.08); filter: drop-shadow(0 0 60px #ec4899); }
  100% { transform: scale(1); filter: drop-shadow(0 0 25px #06b6d4); }
}
.anim-super-neon {
  animation: mySuperNeon 0.8s ease forwards;
}`
  },
  {
    name: '🔥 Altın Alev Kutlaması',
    code: `/* Özel Altın Alev Efekti */
@keyframes goldenFire {
  0% { transform: scale(0.5) rotate(-5deg); filter: drop-shadow(0 0 40px #f59e0b); }
  50% { transform: scale(1.1) rotate(5deg); filter: drop-shadow(0 0 70px #ef4444); }
  100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 30px #f59e0b); }
}
.anim-golden-fire {
  animation: goldenFire 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}`
  },
  {
    name: '👾 Matrix Siber Glitch',
    code: `/* Siber Glitch Efekti */
@keyframes matrixGlitch {
  0% { transform: translate(0); text-shadow: 2px 0 #10b981; }
  25% { transform: translate(-6px, 2px); text-shadow: -3px 0 #06b6d4; }
  50% { transform: translate(6px, -2px); text-shadow: 3px 0 #a855f7; }
  75% { transform: translate(-3px, 1px); text-shadow: -2px 0 #ec4899; }
  100% { transform: translate(0); text-shadow: none; }
}
.anim-matrix {
  animation: matrixGlitch 0.5s ease forwards;
}`
  },
  {
    name: '🌈 Gökkuşağı Hediye Çerçevesi',
    code: `/* Hediye Kutusuna Sürekli Gökkuşağı Kenarlık */
@keyframes rainbowBorderShift {
  0% { border-color: #f43f5e; box-shadow: 0 0 30px #f43f5e; }
  33% { border-color: #8b5cf6; box-shadow: 0 0 35px #8b5cf6; }
  66% { border-color: #06b6d4; box-shadow: 0 0 35px #06b6d4; }
  100% { border-color: #f43f5e; box-shadow: 0 0 30px #f43f5e; }
}
.alert-box-inner {
  animation-name: rainbowBorderShift;
  animation-duration: 2.5s;
  animation-iteration-count: infinite;
}`
  }
];
const WIDGET_CATALOG = [
  {
    id: 'widget-anger-meter',
    type: 'angerMeter',
    name: 'Anger Meter',
    category: 'Oyun',
    badge: "Rage Bar",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    width: 640,
    height: 150,
    icon: '🔥',
    previewGradient: 'from-red-950 via-rose-900 to-black',
    previewArt: '😡 ────⚡──── 🤬'
  },
  {
    id: 'widget-principal-office',
    type: 'gameDoodle',
    name: 'Principal Unc Office',
    category: 'Oyun',
    badge: 'Classroom Doodle',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    width: 640,
    height: 400,
    icon: '🏫',
    previewGradient: 'from-amber-950 via-stone-900 to-black',
    previewArt: '👨‍🏫 PRINCIPAL UNC'
  },
  {
    id: 'widget-win-counter-1',
    type: 'winCounter',
    name: 'Win Counter',
    category: 'Oyun',
    badge: "Timmy's Tower",
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    width: 300,
    height: 172,
    icon: '🏆',
    previewGradient: 'from-cyan-950 via-sky-900 to-black',
    previewArt: '3 / 10'
  },
  {
    id: 'widget-round-timer',
    type: 'roundTimer',
    name: 'Round Timer',
    category: 'Oyun',
    badge: "Timmy's Tower +2",
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    width: 320,
    height: 320,
    icon: '⏱️',
    previewGradient: 'from-neutral-900 to-black',
    previewArt: '10'
  },
  {
    id: 'widget-win-counter-2',
    type: 'winCounter',
    name: 'Win Counter',
    category: 'Oyun',
    badge: 'Holy Steps',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    width: 300,
    height: 172,
    icon: '⭐',
    previewGradient: 'from-amber-950 via-yellow-900 to-black',
    previewArt: '4 / 10'
  },
  {
    id: 'widget-team-wins',
    type: 'teamWins',
    name: 'Team Wins',
    category: 'Oyun',
    badge: 'Bridge Rush',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    width: 420,
    height: 180,
    icon: '⚔️',
    previewGradient: 'from-blue-950 via-indigo-900 to-black',
    previewArt: '🔴 3  vs  1 🔵'
  },
  {
    id: 'widget-save-timer',
    type: 'saveTimer',
    name: 'Save Timer',
    category: 'Hedefler',
    badge: "Timmy's Tower Du...",
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    width: 900,
    height: 300,
    icon: '🌹',
    previewGradient: 'from-rose-950 via-pink-900 to-black',
    previewArt: '🌹 SAVE 60s?'
  },
  {
    id: 'widget-video',
    type: 'videoPlayer',
    name: 'Edit & Video Oynatıcı',
    category: 'Uyarılar',
    badge: 'Özel Edit Videoları',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    width: 1000,
    height: 1000,
    icon: '🎬',
    previewGradient: 'from-purple-950 via-indigo-900 to-black',
    previewArt: '🎬 EDIT PLAYER'
  },
  {
    id: 'widget-alert',
    type: 'alertBox',
    name: 'Uyarı Kutusu (Hediyeler)',
    category: 'Uyarılar',
    badge: '3D Neon Combo',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    width: 900,
    height: 220,
    icon: '🔔',
    previewGradient: 'from-fuchsia-950 via-pink-900 to-black',
    previewArt: '🦁 ASLAN x10 KOMBO!'
  },
  {
    id: 'widget-goal',
    type: 'goalBar',
    name: 'Hedef Çubuğu (Goal Bar)',
    category: 'Hedefler',
    badge: 'Işıltılı Neon Bar',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    width: 900,
    height: 65,
    icon: '🎯',
    previewGradient: 'from-emerald-950 via-teal-900 to-black',
    previewArt: '🎯 850 / 1.000 (%85)'
  },
  {
    id: 'widget-leaderboard',
    type: 'leaderboard',
    name: 'Hediye Lider Tablosu',
    category: 'İzleyiciler',
    badge: 'Top 5 Taç Rozetli',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    width: 380,
    height: 320,
    icon: '👑',
    previewGradient: 'from-amber-950 via-stone-900 to-black',
    previewArt: '🥇 1. Ahmet 💎 50.000'
  },
  {
    id: 'widget-chat',
    type: 'chatStream',
    name: 'Canlı Sohbet Akışı',
    category: 'İzleyiciler',
    badge: 'Sohbet Balonları',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    width: 480,
    height: 440,
    icon: '💬',
    previewGradient: 'from-blue-950 via-slate-900 to-black',
    previewArt: '💬 Canlı Yorumlar'
  },
  {
    id: 'widget-counters',
    type: 'counters',
    name: 'Beğeni & Jeton Sayaçları',
    category: 'İstatistikler',
    badge: 'Canlı İstatistik',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    width: 460,
    height: 140,
    icon: '📊',
    previewGradient: 'from-violet-950 via-purple-900 to-black',
    previewArt: '❤️ 14.5K  |  💎 3.2K'
  },
  {
    id: 'widget-viewers',
    type: 'viewerCount',
    name: 'Canlı İzleyici Sayacı',
    category: 'İzleyiciler',
    badge: 'Canlı Rozet',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    width: 200,
    height: 50,
    icon: '👥',
    previewGradient: 'from-rose-950 via-red-900 to-black',
    previewArt: '🔴 254 İzleyici'
  },
  {
    id: 'widget-ticker',
    type: 'ticker',
    name: 'Kayan Bildirim Bandı',
    category: 'Metin',
    badge: 'Son Olaylar',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    width: 960,
    height: 40,
    icon: '📢',
    previewGradient: 'from-slate-900 to-black',
    previewArt: '✨ Son Takipçi: @user'
  },
  {
    id: 'widget-custom',
    type: 'customText',
    name: 'Özel Metin & Logo',
    category: 'Metin',
    badge: 'Yayıncı Etiketi',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    width: 300,
    height: 60,
    icon: '✍️',
    previewGradient: 'from-cyan-950 via-blue-900 to-black',
    previewArt: 'TikFlow TikTok LIVE'
  }
];

const CATEGORIES = ['Tümü', 'Hedefler', 'Uyarılar', 'İzleyiciler', 'İstatistikler', 'Metin', 'Oyun'];

export default function ScreenEditorPage() {
  const {
    status,
    copyOverlayUrl,
    testOverlay,
    showToast,
    activeProfileId
  } = useApp();

  const [widgets, setWidgets] = useState([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');

  // Dragging & Resizing State on Canvas
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [widgetInitialPos, setWidgetInitialPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const canvasRef = useRef(null);

  const overlayUrl = `http://localhost:${status.port || 21420}/overlay`;

  // Scale of canvas representation (internal resolution is 1080x1920)
  // Let's render the phone at 360x640 in screen, which is scale 360/1080 = 1/3
  const CANVAS_SCALE = 0.3333;
  const CANVAS_W = 1080;
  const CANVAS_H = 1920;
  const DISPLAY_W = CANVAS_W * CANVAS_SCALE; // 360px
  const DISPLAY_H = CANVAS_H * CANVAS_SCALE; // 640px

  const [showCssModal, setShowCssModal] = useState(false);
  const [customCssCode, setCustomCssCode] = useState('');
  const [isSavingCss, setIsSavingCss] = useState(false);
  const [activeTestAnim, setActiveTestAnim] = useState('neon-pulse');

  useEffect(() => {
    fetchLayout();
    fetchCustomCss();
  }, [activeProfileId]);

  const fetchCustomCss = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setCustomCssCode(data.customCss || '');
      }
    } catch (e) {}
  };

  const handleSaveCustomCss = async () => {
    setIsSavingCss(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customCss: customCssCode })
      });
      if (res.ok) {
        showToast('success', 'Özel Animasyon & CSS Kaydedildi!', 'Overlay ekranı canlı olarak güncellendi.');
        setShowCssModal(false);
      }
    } catch (e) {
      showToast('error', 'Hata', 'CSS kaydedilemedi.');
    } finally {
      setIsSavingCss(false);
    }
  };

  const triggerAnimationTest = async (animId) => {
    setActiveTestAnim(animId);
    try {
      await fetch('/api/overlay/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animation: animId,
          text: `🎉 ${animId.toUpperCase()} Animasyon Testi!`,
          subText: 'TikFlow Canlı Önizleme Testi',
          combo: animId === 'fire-burst' ? 5 : 1
        })
      });
      showToast('info', 'Efekt Gönderildi ⚡', `"${animId}" efekti canlı overlay ekranına iletildi.`);
    } catch (e) {
      showToast('error', 'Hata', 'Animasyon test edilemedi');
    }
  };

  const fetchLayout = async () => {
    try {
      const res = await fetch(`/api/overlay/layout?profileId=${activeProfileId}`);
      if (res.ok) {
        const data = await res.json();
        setWidgets(data);
        if (data.length > 0 && !selectedWidgetId) setSelectedWidgetId(data[0].id);
      }
    } catch (e) {}
  };

  const widgetsRef = useRef(widgets);
  widgetsRef.current = widgets;
  const selectedWidgetIdRef = useRef(selectedWidgetId);
  selectedWidgetIdRef.current = selectedWidgetId;

  const autoSaveTimeoutRef = useRef(null);

  const saveLayoutDirect = async (layoutToSave) => {
    try {
      await fetch('/api/overlay/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: layoutToSave, profileId: activeProfileId })
      });
    } catch (e) {}
  };

  const scheduleAutoSave = (nextWidgets) => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveLayoutDirect(nextWidgets);
    }, 150);
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/overlay/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: widgets, profileId: activeProfileId })
      });
      if (res.ok) {
        showToast('success', 'Yerleşim Kaydedildi!', 'Overlay ekranı canlı olarak güncellendi.');
      }
    } catch (e) {
      showToast('error', 'Hata', 'Yerleşim kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);

  const updateSelected = (updates) => {
    const curId = selectedWidgetIdRef.current;
    if (!curId) return;
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === curId ? { ...w, ...updates } : w));
      widgetsRef.current = next;
      scheduleAutoSave(next);
      return next;
    });
  };

  const toggleWidget = (catalogItem) => {
    const existing = widgets.find((w) => w.id === catalogItem.id);
    let nextWidgets;
    if (existing) {
      const nextEnabled = !existing.enabled;
      nextWidgets = widgets.map((w) => (w.id === catalogItem.id ? { ...w, enabled: nextEnabled } : w));
      setWidgets(nextWidgets);
      widgetsRef.current = nextWidgets;
      if (nextEnabled) setSelectedWidgetId(catalogItem.id);
    } else {
      // Add new widget to layout
      const newWidget = {
        id: catalogItem.id,
        type: catalogItem.type,
        name: catalogItem.name,
        enabled: true,
        x: Math.round((CANVAS_W - catalogItem.width) / 2),
        y: Math.round((CANVAS_H - catalogItem.height) / 2),
        width: catalogItem.width,
        height: catalogItem.height,
        zIndex: 15,
        opacity: 100,
        rotation: 0
      };
      nextWidgets = [...widgets, newWidget];
      setWidgets(nextWidgets);
      widgetsRef.current = nextWidgets;
      setSelectedWidgetId(catalogItem.id);
    }
    saveLayoutDirect(nextWidgets);
  };

  // Mouse drag handlers
  const handlePointerDownWidget = (e, widget) => {
    e.stopPropagation();
    setSelectedWidgetId(widget.id);
    setIsDragging(true);
    setIsResizing(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setWidgetInitialPos({ x: widget.x, y: widget.y, w: widget.width, h: widget.height });
  };

  const handlePointerDownResize = (e, widget) => {
    e.stopPropagation();
    setSelectedWidgetId(widget.id);
    setIsResizing(true);
    setIsDragging(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setWidgetInitialPos({ x: widget.x, y: widget.y, w: widget.width, h: widget.height });
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging && !isResizing) return;
      const curId = selectedWidgetIdRef.current;
      const targetWidget = widgetsRef.current.find((w) => w.id === curId);
      if (!targetWidget) return;

      const deltaScreenX = e.clientX - dragStart.x;
      const deltaScreenY = e.clientY - dragStart.y;
      const deltaCanvasX = deltaScreenX / CANVAS_SCALE;
      const deltaCanvasY = deltaScreenY / CANVAS_SCALE;

      if (isDragging) {
        const nextX = Math.round(Math.max(0, Math.min(CANVAS_W - targetWidget.width, widgetInitialPos.x + deltaCanvasX)));
        const nextY = Math.round(Math.max(0, Math.min(CANVAS_H - targetWidget.height, widgetInitialPos.y + deltaCanvasY)));
        updateSelected({ x: nextX, y: nextY });
      } else if (isResizing) {
        const nextW = Math.round(Math.max(80, Math.min(CANVAS_W, widgetInitialPos.w + deltaCanvasX)));
        const nextH = Math.round(Math.max(40, Math.min(CANVAS_H, widgetInitialPos.h + deltaCanvasY)));
        updateSelected({ width: nextW, height: nextH });
      }
    };

    const handlePointerUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        saveLayoutDirect(widgetsRef.current);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isResizing, dragStart, widgetInitialPos]);

  // Filter Catalog
  const filteredCatalog = WIDGET_CATALOG.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'Tümü' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0B0E1A] overflow-hidden select-none">
      {/* Top Banner / Studio Bar */}
      <div className="h-14 border-b border-white/5 px-6 bg-[#0E1326] flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <MonitorPlay className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Yayın Ekranı & Canlı Tuval Editörü</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                1080 × 1920 Dikey
              </span>
            </h2>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
            <span>OBS & Studio için</span>
            <button
              onClick={() => window.open(overlayUrl, '_blank')}
              className="text-cyan-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>Canlı sayfasını aç</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={copyOverlayUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181E38] hover:bg-[#202747] border border-white/10 text-xs font-bold text-slate-200 transition"
            title="OBS Browser Source URL"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>OBS Linkini Kopyala</span>
          </button>

          <button
            onClick={() => setShowCssModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-xs font-bold text-pink-300 transition"
            title="Özel CSS ve @keyframes animasyon kodlama penceresini açar"
          >
            <Code className="w-3.5 h-3.5 text-pink-400" />
            <span>Özel Animasyon / CSS</span>
          </button>

          <button
            onClick={testOverlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Et</span>
          </button>

          <button
            onClick={handleSaveLayout}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Kaydediliyor...' : 'Yerleşimi Kaydet'}</span>
          </button>

          {!isDrawerOpen && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition flex items-center gap-1.5"
            >
              <span>Kitaplığı Aç</span>
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Body: Canvas + Kitaplık Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Center Canvas Area with Dotted Background */}
        <div
          className="flex-1 overflow-auto flex items-center justify-center p-6 relative pt-16"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
          onClick={() => setSelectedWidgetId(null)}
        >
          {/* Top Floating Animation Showcase Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-[#0E1326]/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-2xl max-w-[95%] overflow-x-auto"
          >
            <span className="text-[11px] font-extrabold text-cyan-400 flex items-center gap-1 flex-shrink-0 pr-2.5 border-r border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Efekt Testi:</span>
            </span>
            {ANIMATION_SHOWCASE.map((anim) => (
              <button
                key={anim.id}
                onClick={() => triggerAnimationTest(anim.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 active:scale-95 ${
                  activeTestAnim === anim.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-[#181E38] hover:bg-white/10 text-slate-300 border border-transparent'
                }`}
                title={`Overlay üzerinde "${anim.label}" animasyonunu canlı test et`}
              >
                <span>{anim.icon}</span>
                <span>{anim.label}</span>
              </button>
            ))}
            <button
              onClick={() => setShowCssModal(true)}
              className="ml-1 px-2.5 py-1 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-bold transition flex items-center gap-1 flex-shrink-0"
              title="Kendi özel animasyonunu CSS ile yaz"
            >
              <Plus className="w-3 h-3" />
              <span>Kendi Animasyonunu Yaz</span>
            </button>
          </div>

          {/* Vertical Phone Canvas (TikTok LIVE Ratio) */}
          <div
            ref={canvasRef}
            className="relative bg-gradient-to-b from-[#0F1426] to-[#0A0D18] rounded-[36px] shadow-2xl border-4 border-[#1E2544] overflow-hidden flex-shrink-0"
            style={{
              width: `${DISPLAY_W}px`,
              height: `${DISPLAY_H}px`,
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(6, 182, 212, 0.1)'
            }}
          >
            {/* Phone Speaker Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/60 rounded-full z-30 pointer-events-none flex items-center justify-center">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Central Watermark matching screenshot */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 opacity-15">
              <span className="text-3xl font-black tracking-widest text-white">TIKTOK LIVE</span>
              <span className="text-xs font-semibold tracking-wider text-slate-300 mt-1 uppercase">OYUN TUVANI</span>
            </div>

            {/* Active Widgets on Canvas */}
            {widgets.map((widget) => {
              if (widget.enabled === false) return null;

              const isSelected = widget.id === selectedWidgetId;
              const displayX = widget.x * CANVAS_SCALE;
              const displayY = widget.y * CANVAS_SCALE;
              const displayW = widget.width * CANVAS_SCALE;
              const displayH = widget.height * CANVAS_SCALE;

              return (
                <div
                  key={widget.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWidgetId(widget.id);
                  }}
                  onPointerDown={(e) => handlePointerDownWidget(e, widget)}
                  className={`absolute rounded-xl transition-shadow cursor-move select-none flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-2 border-[#22d3ee] shadow-lg shadow-cyan-500/30 ring-2 ring-[#22d3ee]/40'
                      : 'border border-white/20 hover:border-cyan-400/50 bg-[#141A33]/80 backdrop-blur-sm'
                  }`}
                  style={{
                    left: `${displayX}px`,
                    top: `${displayY}px`,
                    width: `${displayW}px`,
                    height: `${displayH}px`,
                    zIndex: isSelected ? 50 : widget.zIndex || 10,
                    opacity: (widget.opacity !== undefined ? widget.opacity : 100) / 100
                  }}
                >
                  {/* Cyan Title Badge on Top of Selected Widget matching screenshot */}
                  {isSelected && (
                    <div className="absolute -top-6 left-0 px-2 py-0.5 bg-[#22d3ee] text-[#0A0D18] font-black text-[9px] rounded-t-md flex items-center gap-1 shadow-md z-50 whitespace-nowrap">
                      <span>{widget.name}</span>
                      <span className="opacity-80 font-normal">: Özelleştirmek için tıkla</span>
                    </div>
                  )}

                  {/* Widget Visual Content Preview */}
                  <div className="p-2 flex-1 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-base">{WIDGET_CATALOG.find(c => c.id === widget.id)?.icon || '📦'}</span>
                    <span className="text-[10px] font-bold text-white mt-1 leading-tight line-clamp-2">
                      {widget.name}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5">
                      {widget.width} × {widget.height}
                    </span>
                  </div>

                  {/* Bottom Cyan Resize Handle on Selected Widget */}
                  {isSelected && (
                    <div
                      onPointerDown={(e) => handlePointerDownResize(e, widget)}
                      className="absolute bottom-0 right-0 w-4 h-4 bg-[#22d3ee] cursor-nwse-resize flex items-center justify-center rounded-tl-lg z-50"
                      title="Boyutlandır"
                    >
                      <div className="w-1.5 h-1.5 bg-[#0A0D18] rounded-xs" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Floating Widget Inspector Bar when a widget is selected */}
          {selectedWidget && (
            <div
              className="absolute bottom-8 left-8 bg-[#121626]/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-40 max-w-md w-full animate-in fade-in slide-in-from-bottom-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                    ⚙
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {selectedWidget.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedWidgetId(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Coordinates & Size Grid */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">X</label>
                  <input
                    type="number"
                    value={selectedWidget.x}
                    onChange={(e) => updateSelected({ x: Number(e.target.value) })}
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-center text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Y</label>
                  <input
                    type="number"
                    value={selectedWidget.y}
                    onChange={(e) => updateSelected({ y: Number(e.target.value) })}
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-center text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Genişlik</label>
                  <input
                    type="number"
                    value={selectedWidget.width}
                    onChange={(e) => updateSelected({ width: Number(e.target.value) })}
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-center text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Yükseklik</label>
                  <input
                    type="number"
                    value={selectedWidget.height}
                    onChange={(e) => updateSelected({ height: Number(e.target.value) })}
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-center text-xs"
                  />
                </div>
              </div>

              {/* Quick Alignment & Opacity Bar */}
              <div className="mt-3 pt-2.5 border-t border-white/5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => updateSelected({ x: Math.round((CANVAS_W - selectedWidget.width) / 2) })}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 font-semibold transition"
                      title="Yatayda ortala"
                    >
                      ↔ Yatay Ortala
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelected({ y: Math.round((CANVAS_H - selectedWidget.height) / 2) })}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 font-semibold transition"
                      title="Dikeyde ortala"
                    >
                      ↕ Dikey Ortala
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Opaklık:</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={selectedWidget.opacity !== undefined ? selectedWidget.opacity : 100}
                      onChange={(e) => updateSelected({ opacity: Number(e.target.value) })}
                      className="w-16 accent-cyan-400 cursor-pointer h-1.5 bg-[#0B0E1A] rounded-lg"
                    />
                    <span className="text-[10px] font-mono text-cyan-400 w-8 text-right">
                      %{selectedWidget.opacity !== undefined ? selectedWidget.opacity : 100}
                    </span>
                  </div>
                </div>

                {/* Custom Text Editor if Custom Text Widget */}
                {selectedWidget.type === 'customText' && (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Özel Metin / Yayıncı Etiketi</label>
                    <input
                      type="text"
                      value={selectedWidget.customText || ''}
                      placeholder="Örn: ⚡ TikFlow LIVE"
                      onChange={(e) => updateSelected({ customText: e.target.value })}
                      className="w-full bg-[#0B0E1A] border border-cyan-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}

                {/* Goal Bar Editor if Goal Widget */}
                {selectedWidget.type === 'goalBar' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Hedef Başlığı</label>
                      <input
                        type="text"
                        value={selectedWidget.goalTitle || ''}
                        placeholder="Örn: Günün Hediyesi: Aslan!"
                        onChange={(e) => updateSelected({ goalTitle: e.target.value })}
                        className="w-full bg-[#0B0E1A] border border-cyan-500/30 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Hedef Miktarı (Jeton)</label>
                      <input
                        type="number"
                        value={selectedWidget.goalTarget || 1000}
                        onChange={(e) => updateSelected({ goalTarget: Number(e.target.value) })}
                        className="w-full bg-[#0B0E1A] border border-cyan-500/30 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                <button
                  onClick={() => updateSelected({ enabled: false })}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>Tuvalden Kaldır</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={testOverlay}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1"
                    title="Canlı overlay üzerinde animasyonu test eder"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test Et</span>
                  </button>

                  <button
                    onClick={handleSaveLayout}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <Save className="w-3 h-3" />
                    <span>Canlı Uygula</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Bar: Status */}
          <div className="absolute bottom-4 left-6 flex items-center gap-4 text-xs text-slate-400 bg-[#0E1326]/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status.overlayClientCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="font-semibold text-slate-300">
                {status.overlayClientCount > 0 ? 'Tarayıcı Kaynağı Bağlı' : 'Tarayıcı Kaynağı'}
              </span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status.tiktok?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{status.tiktok?.connected ? 'Canlı Yayında' : 'Durduruldu'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: "Kitaplık" (Widget Library Drawer) matching user screenshot */}
        {isDrawerOpen && (
          <div className="w-96 bg-[#121626] border-l border-white/10 flex flex-col flex-shrink-0 z-20 shadow-2xl animate-in slide-in-from-right-10 duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Kitaplık</span>
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Widget ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#181E38] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Category Filter Chips matching screenshot */}
            <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-white/5">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-white text-black shadow-sm'
                        : 'bg-[#181E38] text-slate-400 hover:text-white hover:bg-[#202747]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Widget Cards Grid matching user's image */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredCatalog.map((item) => {
                const existing = widgets.find((w) => w.id === item.id);
                const isAdded = existing && existing.enabled !== false;

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleWidget(item)}
                    className={`p-3 rounded-2xl bg-[#181E38] border transition cursor-pointer flex flex-col group ${
                      isAdded
                        ? 'border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Visual Preview Box */}
                    <div className={`relative aspect-[16/7] rounded-xl bg-gradient-to-br ${item.previewGradient} border border-white/10 overflow-hidden flex items-center justify-center p-3 mb-2.5`}>
                      {/* Category Badge on Top Left matching screenshot */}
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>

                      {/* Preview Art */}
                      <span className="text-sm font-black text-white tracking-wider drop-shadow-md">
                        {item.previewArt}
                      </span>

                      {/* Added Status Checkmark */}
                      {isAdded && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-xs shadow-md">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Card Title & Dimension Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {item.width} × {item.height}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWidget(item);
                        }}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                          isAdded
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {isAdded ? 'Aktif' : 'Ekle'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer Note matching user's image */}
            <div className="p-3 border-t border-white/5 bg-[#0F1426] text-[11px] text-slate-400 leading-tight">
              Ortaya bırakmak için tıkla, tam istediğin yere koymak için tuvalde sürükle. Boyutlandırmak için sağ alttaki tutamacı kullan.
            </div>
          </div>
        )}
      </div>

      {/* Custom Animation & CSS Editor Modal */}
      {showCssModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#12172D] border border-cyan-500/40 w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Özel Animasyon & CSS Düzenleyici</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                      Canlı Enjeksiyon
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tikfinity ve LiveInteract gibi kendi özel animasyonlarınızı veya stil kurallarınızı yazın.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCssModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Bar */}
            <div className="flex items-center gap-2 flex-wrap bg-[#181E38] p-2.5 rounded-2xl border border-white/5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pr-1">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hazır Şablonlar:</span>
              </span>
              {CSS_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCustomCssCode((prev) => (prev ? prev + '\n\n' + p.code : p.code))}
                  className="px-2.5 py-1 rounded-xl bg-[#101426] hover:bg-cyan-500/20 border border-white/10 text-xs font-bold text-cyan-300 hover:border-cyan-500/40 transition flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Code Editor Textarea */}
            <div className="flex-1 flex flex-col space-y-1.5 min-h-[240px]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>CSS ve @keyframes Kodunuz:</span>
                <span className="font-mono text-[10px] text-slate-500">Tüm overlay sınıflarına (.alert-box-inner, .chat-bubble, vb.) stil verilebilir</span>
              </div>
              <textarea
                value={customCssCode}
                onChange={(e) => setCustomCssCode(e.target.value)}
                placeholder="/* Buraya özel animasyonlarınızı veya CSS stillerinizi yazabilirsiniz */&#10;@keyframes ornekAnimasyon {&#10;  0% { transform: scale(0.5); opacity: 0; }&#10;  100% { transform: scale(1); opacity: 1; }&#10;}&#10;.anim-ornek {&#10;  animation: ornekAnimasyon 0.6s ease forwards;&#10;}"
                className="w-full flex-1 bg-[#0A0D18] border border-white/10 rounded-2xl p-4 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 shadow-inner resize-y leading-relaxed"
                rows={10}
                spellCheck="false"
              />
            </div>

            {/* Help / Guidance Box */}
            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Özel Animasyon Nasıl Çalışır?</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  1. <code className="text-cyan-300">@keyframes animAdiniz &#123; ... &#125;</code> ile animasyonunuzu tanımlayın.<br />
                  2. <code className="text-cyan-300">.anim-animAdiniz &#123; animation: animAdiniz 0.7s ease forwards; &#125;</code> sınıfını tanımlayın.<br />
                  3. Kaydettiğinizde anında OBS ve tarayıcı overlay ekranına yansır.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCustomCssCode('')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 text-xs font-semibold transition"
              >
                Temizle
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCssModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={isSavingCss}
                  onClick={handleSaveCustomCss}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingCss ? 'Kaydediliyor...' : 'Kaydet & Canlı Uygula'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
