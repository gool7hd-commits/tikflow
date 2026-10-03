import React, { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import AutomationModal from '../components/AutomationModal';
import ActionModal from '../components/ActionModal';
import EventModal from '../components/EventModal';
import { TIKTOK_GIFTS } from '../../../shared/giftCatalog.js';
import {
  Film,
  Plus,
  Trash2,
  Play,
  Zap,
  Upload,
  Link as LinkIcon,
  Video,
  CheckCircle2,
  AlertCircle,
  Settings,
  Sparkles,
  Volume2,
  Clock,
  Search,
  X,
  ExternalLink,
  Copy
} from 'lucide-react';

export default function EditsPage() {
  const {
    mediaList,
    uploadMedia,
    deleteMedia,
    automations,
    testMedia,
    bindMediaGift,
    copyOverlayUrl
  } = useApp();

  const fileInputRef = useRef(null);
  const [selectedMediaForAdvanced, setSelectedMediaForAdvanced] = useState(null);
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);

  // Quick Bind Modal State
  const [quickBindMedia, setQuickBindMedia] = useState(null);
  const [selectedGiftType, setSelectedGiftType] = useState('specific'); // 'all' | 'specific' | 'diamonds'
  const [selectedGift, setSelectedGift] = useState(TIKTOK_GIFTS[1] || TIKTOK_GIFTS[0]); // Default to Lion or Rose
  const [giftSearch, setGiftSearch] = useState('');
  const [minDiamonds, setMinDiamonds] = useState(100);
  const [videoDuration, setVideoDuration] = useState(6);
  const [videoVolume, setVideoVolume] = useState(100);
  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [isSavingBind, setIsSavingBind] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionModalMedia, setActionModalMedia] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  // Filter video and gif items
  const edits = mediaList.filter((m) => m.type === 'video' || m.type === 'gif');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await uploadMedia(file, file.name.replace(/\.[^/.]+$/, ''), 6);
    e.target.value = '';
    if (uploaded) {
      // Prompt user to immediately bind gift to the newly uploaded edit!
      openQuickBind(uploaded);
    }
  };

  const openQuickBind = (media) => {
    // Check if already bound
    const boundAuto = automations.find((a) =>
      a.aksiyonlar?.some((act) => act.mediaUrl === media.relativeUrl || act.mediaId === media.id)
    );

    if (boundAuto) {
      const cfg = boundAuto.tetikleyici?.config || {};
      if (cfg.matchType === 'any' || cfg.matchType === 'all') {
        setSelectedGiftType('all');
      } else if (cfg.matchType === 'diamonds') {
        setSelectedGiftType('diamonds');
        setMinDiamonds(cfg.minDiamonds || 100);
      } else {
        setSelectedGiftType('specific');
        const found = TIKTOK_GIFTS.find(
          (g) =>
            g.name.toLowerCase() === (cfg.giftName || '').toLowerCase() ||
            g.turkishName.toLowerCase() === (cfg.turkishName || '').toLowerCase()
        );
        if (found) setSelectedGift(found);
      }
      const mediaAct = boundAuto.aksiyonlar?.find((a) => a.type === 'media');
      if (mediaAct) {
        setVideoDuration(mediaAct.duration || 6);
        setVideoVolume(mediaAct.volume !== undefined ? mediaAct.volume : 100);
      }
    } else {
      setSelectedGiftType('specific');
      setSelectedGift(TIKTOK_GIFTS.find((g) => g.name === 'Lion') || TIKTOK_GIFTS[0]);
      setVideoDuration(media.duration || 6);
      setVideoVolume(100);
    }

    setQuickBindMedia(media);
  };

  const handleSaveQuickBind = async () => {
    if (!quickBindMedia) return;
    setIsSavingBind(true);

    let payload = {
      duration: videoDuration,
      volume: videoVolume,
      alertTitle: showAlertBanner ? `🎉 {kullanici} {hediye} gönderdi!` : false
    };

    if (selectedGiftType === 'all') {
      payload.giftName = 'ALL';
      payload.turkishName = 'Tüm Hediyeler';
    } else if (selectedGiftType === 'diamonds') {
      payload.diamonds = minDiamonds;
      payload.turkishName = `${minDiamonds}+ Jetonluk Hediyeler`;
    } else {
      payload.giftName = selectedGift.name;
      payload.turkishName = selectedGift.turkishName || selectedGift.name;
      payload.diamonds = selectedGift.diamonds;
    }

    await bindMediaGift(quickBindMedia.id, payload);
    setIsSavingBind(false);
    setQuickBindMedia(null);
  };

  const handleOpenAdvanced = (media) => {
    const boundAuto = automations.find((a) =>
      a.aksiyonlar?.some((act) => act.mediaUrl === media.relativeUrl || act.mediaId === media.id)
    );

    if (boundAuto) {
      setSelectedMediaForAdvanced(boundAuto);
    } else {
      const template = {
        ad: `${media.name} Oynatımı`,
        aktif: true,
        conflictMode: 'queue',
        cooldownSec: 1,
        tetikleyici: {
          type: 'gift',
          config: {
            matchType: 'specific',
            giftName: 'Lion',
            turkishName: 'Aslan',
            minDiamonds: 29999,
            minCount: 1,
            onlyStreakEnd: false
          }
        },
        aksiyonlar: [
          {
            id: 'act-' + Date.now(),
            type: 'media',
            mediaUrl: media.relativeUrl,
            mediaId: media.id,
            duration: media.duration || 6,
            animation: 'fade',
            volume: 100,
            location: 'center'
          },
          {
            id: 'act-' + (Date.now() + 1),
            type: 'alert',
            text: `🦁 {kullanici} {hediye} gönderdi!`,
            subText: 'Özel edit yayında!',
            duration: media.duration || 6,
            animation: 'zoom'
          }
        ]
      };
      setSelectedMediaForAdvanced(template);
    }
    setAdvancedModalOpen(true);
  };

  const filteredCatalog = TIKTOK_GIFTS.filter(
    (g) =>
      g.name.toLowerCase().includes(giftSearch.toLowerCase()) ||
      g.turkishName.toLowerCase().includes(giftSearch.toLowerCase())
  ).slice(0, 30);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Film className="w-5 h-5" />
            </div>
            <span>Edit & Video Kütüphanesi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Yayınlarınızda TikTok hediyeleri geldiğinde otomatik oynatılacak MP4, WebM (şeffaf video) ve GIF editleriniz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyOverlayUrl}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition"
            title="OBS Browser Source URL"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>OBS Linkini Kopyala</span>
          </button>

          <button
            onClick={() => {
              setActionModalMedia(null);
              setActionModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A223D] hover:bg-[#222C4E] border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-lg transition active:scale-95"
            title="Video, Ses veya Uyarı Eylemi Oluşturun"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Yeni Eylem Tanımla</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/mp4,video/webm,video/quicktime,image/gif"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Bilgisayardan Edit Yükle</span>
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/10 to-transparent border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-white">Nasıl Çalışır?</span> Edit videosunu yükleyin, ardından istediğiniz TikTok hediyesiyle eşleştirin. Canlı yayında o hediye atıldığı an video OBS ve yayınınızda otomatik başlar.
          </div>
        </div>
      </div>

      {/* Grid of Edits */}
      {edits.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#13182C] border border-white/5 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">Henüz Hiç Edit Eklenmedi</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bilgisayarınızdan MP4, şeffaf WebM veya GIF dosyalarını yükleyerek TikTok hediyelerine bağlayabilirsiniz.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-lg shadow-purple-500/20"
          >
            İlk Editi Yükle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {edits.map((item) => {
            // Find active automation using this media
            const boundAuto = automations.find((a) =>
              a.aksiyonlar?.some(
                (act) => act.mediaUrl === item.relativeUrl || act.mediaId === item.id
              )
            );

            const isBound = !!boundAuto;
            const triggerInfo = boundAuto?.tetikleyici?.config;
            let triggerBadgeText = 'Hediye Bağlı Değil';
            if (isBound) {
              if (triggerInfo?.matchType === 'any' || triggerInfo?.matchType === 'all') {
                triggerBadgeText = '🎁 Tüm Hediyeler';
              } else if (triggerInfo?.matchType === 'diamonds') {
                triggerBadgeText = `💎 ${triggerInfo.minDiamonds}+ Jeton`;
              } else {
                triggerBadgeText = `🎁 ${triggerInfo?.turkishName || triggerInfo?.giftName || 'Hediye'}`;
              }
            }

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl bg-[#13182C] border transition flex flex-col justify-between group ${
                  isBound ? 'border-purple-500/40 shadow-lg shadow-purple-500/5' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  {/* Media Preview Box */}
                  <div className="relative aspect-video rounded-xl bg-[#0B0E1A] overflow-hidden mb-3 border border-white/5 flex items-center justify-center group-hover:border-purple-500/30 transition">
                    {item.type === 'video' ? (
                      <video
                        src={item.relativeUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.target.play().catch(() => {})}
                        onMouseLeave={(e) => e.target.pause()}
                      />
                    ) : (
                      <img src={item.relativeUrl} alt={item.name} className="w-full h-full object-contain" />
                    )}

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-white">
                      {item.type.toUpperCase()}
                    </div>

                    {/* Quick Test Play Overlay on Hover */}
                    <button
                      onClick={() => testMedia(item)}
                      className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white gap-2 font-bold text-xs"
                      title="OBS Overlay'de Test Et"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center shadow-lg transition active:scale-95">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-white truncate" title={item.name}>
                    {item.name}
                  </h3>

                  {/* Bound Gift Status Badge */}
                  <div className="mt-2.5">
                    <button
                      onClick={() => openQuickBind(item)}
                      className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-between transition ${
                        isBound
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                      }`}
                      title="Tetikleyici hediyeyi değiştirmek için tıklayın"
                    >
                      <span className="truncate flex items-center gap-1.5">
                        {isBound ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        <span className="truncate">{triggerBadgeText}</span>
                      </span>
                      <span className="text-[10px] opacity-75 ml-1">Değiştir</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center gap-2 mt-4">
                  <button
                    onClick={() => testMedia(item)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                    title="Bu editi hemen OBS overlay ekranında oynat"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Et</span>
                  </button>

                  <button
                    onClick={() => {
                      setActionModalMedia(item);
                      setActionModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 transition"
                    title="Bu Video İçin Özel Eylem Oluştur"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenAdvanced(item)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    title="Gelişmiş Kural Ayarları"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteMedia(item.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK BIND MODAL */}
      {quickBindMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#12172D] border border-purple-500/30 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Editi TikTok Hediyesine Bağla</h3>
                  <p className="text-xs text-slate-400 truncate max-w-sm">
                    {quickBindMedia.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickBindMedia(null)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trigger Selection Tabs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Bu edit video ne zaman ekranda oynatılsın?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGiftType('specific')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    selectedGiftType === 'specific'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                      : 'bg-[#181E38] text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  <span>Belirli Bir Hediye</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGiftType('all')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    selectedGiftType === 'all'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                      : 'bg-[#181E38] text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  <span>Tüm Hediyeler</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGiftType('diamonds')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    selectedGiftType === 'diamonds'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                      : 'bg-[#181E38] text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  <span>Jeton Limitine Göre</span>
                </button>
              </div>
            </div>

            {/* Specific Gift Selector */}
            {selectedGiftType === 'specific' && (
              <div className="space-y-2 p-3 bg-[#0B0E1A] rounded-2xl border border-white/5">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Hediye ara (Gül, Aslan, Kalp, Asa, vb.)..."
                    value={giftSearch}
                    onChange={(e) => setGiftSearch(e.target.value)}
                    className="w-full bg-[#181E38] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredCatalog.map((g) => {
                    const isSelected = selectedGift?.name === g.name;
                    return (
                      <button
                        key={g.id || g.name}
                        type="button"
                        onClick={() => setSelectedGift(g)}
                        className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition ${
                          isSelected
                            ? 'bg-purple-600/30 border border-purple-500/50 text-white'
                            : 'hover:bg-white/5 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {g.icon ? (
                            <img src={g.icon} alt={g.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-xs">🎁</div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-white">{g.turkishName || g.name}</div>
                            <div className="text-[10px] text-slate-400">{g.name}</div>
                          </div>
                        </div>
                        <div className="text-[11px] font-mono font-bold text-amber-400">
                          {g.diamonds?.toLocaleString()} 💎
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Diamond Limit Selector */}
            {selectedGiftType === 'diamonds' && (
              <div className="p-4 bg-[#0B0E1A] rounded-2xl border border-white/5 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Minimum Jeton Değeri
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={minDiamonds}
                    onChange={(e) => setMinDiamonds(Number(e.target.value))}
                    className="flex-1 bg-[#181E38] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                  <span className="text-xs text-amber-400 font-bold font-mono">ve üzeri elmas</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Yayın sırasında en az bu değerde veya üzerinde herhangi bir hediye geldiğinde video oynatılır.
                </p>
              </div>
            )}

            {/* Video Duration & Volume Sliders */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#0B0E1A] rounded-2xl border border-white/5">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Oynatma Süresi: {videoDuration} sn</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full accent-purple-500 mt-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Video Ses Düzeyi: %{videoVolume}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={videoVolume}
                  onChange={(e) => setVideoVolume(Number(e.target.value))}
                  className="w-full accent-cyan-500 mt-2"
                />
              </div>
            </div>

            {/* Show Alert Banner Checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={showAlertBanner}
                onChange={(e) => setShowAlertBanner(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500"
              />
              <span>Video oynatılırken aynı anda ekranda hediye kutlama bildirimi de gösterilsin</span>
            </label>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setQuickBindMedia(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={isSavingBind}
                onClick={handleSaveQuickBind}
                className="px-5 py-2.5 rounded-xl gradient-brand text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition disabled:opacity-50"
              >
                {isSavingBind ? 'Kaydediliyor...' : 'Kaydet ve Yayına Bağla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Automation Modal */}
      {advancedModalOpen && (
        <AutomationModal
          automation={selectedMediaForAdvanced}
          onClose={() => {
            setAdvancedModalOpen(false);
            setSelectedMediaForAdvanced(null);
          }}
        />
      )}

      {/* Action Modal */}
      {actionModalOpen && (
        <ActionModal
          isOpen={true}
          action={actionModalMedia ? {
            name: actionModalMedia.name,
            videoUrl: actionModalMedia.relativeUrl,
            videoFileName: actionModalMedia.originalName || actionModalMedia.name,
            duration: actionModalMedia.duration || 6,
            types: { video: true, sound: false, alert: false, tts: false }
          } : null}
          onClose={() => {
            setActionModalOpen(false);
            setActionModalMedia(null);
          }}
          onSave={() => {
            setActionModalOpen(false);
            setActionModalMedia(null);
          }}
        />
      )}

      {/* Event Modal */}
      {eventModalOpen && (
        <EventModal
          isOpen={true}
          onClose={() => setEventModalOpen(false)}
        />
      )}
    </div>
  );
}
