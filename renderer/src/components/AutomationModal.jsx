import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { TIKTOK_GIFTS } from '../../../shared/giftCatalog.js';
import {
  X,
  Zap,
  Plus,
  Trash2,
  Play,
  Save,
  Film,
  Volume2,
  Bell,
  Mic,
  Tv,
  Globe,
  HelpCircle
} from 'lucide-react';

export default function AutomationModal({ automation, onClose }) {
  const { saveAutomation, testAutomation, mediaList } = useApp();

  const [formData, setFormData] = useState({
    ad: '',
    aktif: true,
    conflictMode: 'queue', // 'queue' | 'multi' | 'interrupt'
    cooldownSec: 0,
    userLimitSec: 0,
    multiplier: false,
    randomPool: false,
    tetikleyici: {
      type: 'gift', // 'gift' | 'comment' | 'like' | 'follow' | 'share' | 'member' | 'subscribe' | 'timer'
      config: {
        matchType: 'specific',
        giftName: 'Lion',
        turkishName: 'Aslan',
        minDiamonds: 0,
        maxDiamonds: 99999,
        minCount: 1,
        onlyStreakEnd: false,
        keyword: '',
        caseSensitive: false,
        specificUser: '',
        step: 1000,
        minutes: 5
      }
    },
    aksiyonlar: []
  });

  useEffect(() => {
    if (automation) {
      setFormData({
        ...automation,
        tetikleyici: {
          ...automation.tetikleyici,
          config: {
            matchType: 'specific',
            giftName: 'Lion',
            turkishName: 'Aslan',
            minDiamonds: 0,
            maxDiamonds: 99999,
            minCount: 1,
            onlyStreakEnd: false,
            step: 1000,
            minutes: 5,
            ...(automation.tetikleyici?.config || {})
          }
        },
        aksiyonlar: automation.aksiyonlar || []
      });
    } else {
      // Default new automation template with alert & sound
      setFormData((prev) => ({
        ...prev,
        ad: 'Yeni Otomasyon',
        aksiyonlar: [
          {
            id: 'act-' + Date.now(),
            type: 'alert',
            text: '🦁 {kullanici} {hediye} gönderdi x{adet}!',
            subText: '{jeton} Jeton Değerinde Destek!',
            duration: 5,
            animation: 'zoom',
            location: 'center'
          },
          {
            id: 'act-' + (Date.now() + 1),
            type: 'sound',
            soundUrl: '/default-sounds/tada.wav',
            volume: 80
          }
        ]
      }));
    }
  }, [automation]);

  const handleAddAction = (type) => {
    let newAct = { id: 'act-' + Date.now(), type };

    if (type === 'alert') {
      newAct = {
        ...newAct,
        text: '🎉 {kullanici} {hediye} gönderdi x{adet}!',
        subText: 'Teşekkürler!',
        duration: 5,
        animation: 'zoom',
        location: 'center'
      };
    } else if (type === 'media') {
      const firstMedia = mediaList.find((m) => m.type === 'video' || m.type === 'gif');
      newAct = {
        ...newAct,
        mediaUrl: firstMedia?.relativeUrl || '',
        duration: 5,
        animation: 'fade',
        volume: 100,
        location: 'center'
      };
    } else if (type === 'sound') {
      newAct = {
        ...newAct,
        soundUrl: '/default-sounds/bell.wav',
        volume: 80
      };
    } else if (type === 'tts') {
      newAct = {
        ...newAct,
        ttsTemplate: '{kullanici}: {yorum}',
        voice: 'tr-TR',
        rate: 1.0
      };
    } else if (type === 'obs') {
      newAct = {
        ...newAct,
        obsAction: 'switchScene',
        sceneName: ''
      };
    } else if (type === 'webhook') {
      newAct = {
        ...newAct,
        webhookUrl: 'https://example.com/api/webhook'
      };
    }

    setFormData((prev) => ({
      ...prev,
      aksiyonlar: [...prev.aksiyonlar, newAct]
    }));
  };

  const handleRemoveAction = (idx) => {
    setFormData((prev) => ({
      ...prev,
      aksiyonlar: prev.aksiyonlar.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateAction = (idx, updates) => {
    setFormData((prev) => {
      const copy = [...prev.aksiyonlar];
      copy[idx] = { ...copy[idx], ...updates };
      return { ...prev, aksiyonlar: copy };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.ad.trim()) return;
    const ok = await saveAutomation(formData);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#12172D] border border-purple-500/40 w-full max-w-4xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {automation ? 'Otomasyonu Düzenle' : 'Yeni Otomasyon Oluştur'}
              </h2>
              <p className="text-xs text-slate-400">
                Tetikleyici ve çoklu aksiyon zincirini yapılandırın.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* 1. General Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Otomasyon Adı</label>
              <input
                type="text"
                required
                value={formData.ad}
                onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                placeholder="Örn: Aslan Geldiğinde Özel Kutlama"
                className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Durum</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, aktif: !formData.aktif })}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  formData.aktif
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-white/10 text-slate-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${formData.aktif ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span>{formData.aktif ? 'Aktif (Çalışıyor)' : 'Devre Dışı'}</span>
              </button>
            </div>
          </div>

          {/* 2. Trigger Configuration */}
          <div className="p-4 bg-[#181E38] rounded-2xl border border-white/5 space-y-4">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
              1. Tetikleyici Olayı (Ne Zaman Çalışsın?)
            </span>

            {/* Trigger Type Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'gift', label: '🎁 Hediye' },
                { type: 'comment', label: '💬 Yorum / Chat' },
                { type: 'like', label: '❤️ Beğeni' },
                { type: 'follow', label: '👋 Yeni Takipçi' },
                { type: 'share', label: '🚀 Yayını Paylaş' },
                { type: 'member', label: '🚪 Odaya Katılma' },
                { type: 'timer', label: '⏱️ Zamanlayıcı' }
              ].map((t) => (
                <button
                  type="button"
                  key={t.type}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tetikleyici: { ...formData.tetikleyici, type: t.type }
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    formData.tetikleyici.type === t.type
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                      : 'bg-[#101426] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Trigger Details by Type */}
            {formData.tetikleyici.type === 'gift' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Hediye Filtresi
                  </label>
                  <select
                    value={formData.tetikleyici.config?.matchType || 'specific'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tetikleyici: {
                          ...formData.tetikleyici,
                          config: { ...formData.tetikleyici.config, matchType: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="specific">Belirli Bir Hediye</option>
                    <option value="diamonds">Jeton Değer Aralığı</option>
                    <option value="any">Herhangi Bir Hediye</option>
                  </select>
                </div>

                {formData.tetikleyici.config?.matchType === 'specific' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Hediye Seçimi
                    </label>
                    <select
                      value={formData.tetikleyici.config?.giftName || 'Lion'}
                      onChange={(e) => {
                        const sel = TIKTOK_GIFTS.find((g) => g.name === e.target.value);
                        setFormData({
                          ...formData,
                          tetikleyici: {
                            ...formData.tetikleyici,
                            config: {
                              ...formData.tetikleyici.config,
                              giftName: sel?.name || e.target.value,
                              turkishName: sel?.turkishName || e.target.value,
                              minDiamonds: sel?.diamonds || 0
                            }
                          }
                        });
                      }}
                      className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {TIKTOK_GIFTS.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.turkishName} ({g.diamonds} 💎)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.tetikleyici.config?.matchType === 'diamonds' && (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min Jeton</label>
                      <input
                        type="number"
                        value={formData.tetikleyici.config?.minDiamonds || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tetikleyici: {
                              ...formData.tetikleyici,
                              config: { ...formData.tetikleyici.config, minDiamonds: Number(e.target.value) }
                            }
                          })
                        }
                        className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Maks Jeton</label>
                      <input
                        type="number"
                        value={formData.tetikleyici.config?.maxDiamonds || 99999}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tetikleyici: {
                              ...formData.tetikleyici,
                              config: { ...formData.tetikleyici.config, maxDiamonds: Number(e.target.value) }
                            }
                          })
                        }
                        className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Minimum Adet
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.tetikleyici.config?.minCount || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tetikleyici: {
                          ...formData.tetikleyici,
                          config: { ...formData.tetikleyici.config, minCount: Number(e.target.value) }
                        }
                      })
                    }
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {formData.tetikleyici.type === 'comment' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Eşleşme Tipi</label>
                  <select
                    value={formData.tetikleyici.config?.matchType || 'contains'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tetikleyici: {
                          ...formData.tetikleyici,
                          config: { ...formData.tetikleyici.config, matchType: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="contains">Kelimeyi İçerir</option>
                    <option value="exact">Birebir Aynı</option>
                    <option value="regex">Düzenli İfade (Regex)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Anahtar Kelime</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: KORKU"
                    value={formData.tetikleyici.config?.keyword || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tetikleyici: {
                          ...formData.tetikleyici,
                          config: { ...formData.tetikleyici.config, keyword: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Özel Kullanıcı (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Yalnızca bu kullanıcıdan gelirse"
                    value={formData.tetikleyici.config?.specificUser || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tetikleyici: {
                          ...formData.tetikleyici,
                          config: { ...formData.tetikleyici.config, specificUser: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {formData.tetikleyici.type === 'like' && (
              <div className="pt-2 max-w-xs">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Her X Beğenide Bir Tetikle
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={formData.tetikleyici.config?.step || 1000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tetikleyici: {
                        ...formData.tetikleyici,
                        config: { ...formData.tetikleyici.config, step: Number(e.target.value) }
                      }
                    })
                  }
                  className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            )}

            {formData.tetikleyici.type === 'timer' && (
              <div className="pt-2 max-w-xs">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tekrar Süresi (Dakika)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.tetikleyici.config?.minutes || 5}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tetikleyici: {
                        ...formData.tetikleyici,
                        config: { ...formData.tetikleyici.config, minutes: Number(e.target.value) }
                      }
                    })
                  }
                  className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            )}
          </div>

          {/* 3. Actions Builder */}
          <div className="p-4 bg-[#181E38] rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                  2. Aksiyonlar (Ne Yapılsın?)
                </span>
                <span className="text-[11px] text-slate-400">
                  Birden fazla aksiyon zincirleme ekleyebilirsiniz.
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddAction('alert')}
                  className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-lg text-xs font-bold text-purple-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Uyarı Kutusu
                </button>
                <button
                  type="button"
                  onClick={() => handleAddAction('media')}
                  className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 rounded-lg text-xs font-bold text-indigo-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Edit/Video
                </button>
                <button
                  type="button"
                  onClick={() => handleAddAction('sound')}
                  className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Ses Çal
                </button>
                <button
                  type="button"
                  onClick={() => handleAddAction('tts')}
                  className="px-2.5 py-1 bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 rounded-lg text-xs font-bold text-pink-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> TTS Oku
                </button>
              </div>
            </div>

            {/* Actions List */}
            <div className="space-y-3">
              {formData.aksiyonlar.map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="p-3.5 bg-[#101426] border border-white/5 rounded-2xl space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      {act.type === 'alert' && <Bell className="w-4 h-4 text-purple-400" />}
                      {act.type === 'media' && <Film className="w-4 h-4 text-indigo-400" />}
                      {act.type === 'sound' && <Volume2 className="w-4 h-4 text-cyan-400" />}
                      {act.type === 'tts' && <Mic className="w-4 h-4 text-pink-400" />}
                      {act.type === 'obs' && <Tv className="w-4 h-4 text-amber-400" />}
                      {act.type === 'webhook' && <Globe className="w-4 h-4 text-emerald-400" />}
                      <span>
                        Aksiyon #{idx + 1}:{' '}
                        {act.type === 'alert'
                          ? 'Uyarı Banner'
                          : act.type === 'media'
                          ? 'Video / Edit / GIF'
                          : act.type === 'sound'
                          ? 'Ses Efekti'
                          : act.type === 'tts'
                          ? 'TTS Seslendirme'
                          : act.type}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Aksiyonu Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Alert Action Form */}
                  {act.type === 'alert' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Başlık Metni ({'{kullanici}'}, {'{hediye}'}, {'{adet}'}, {'{jeton}'})
                        </label>
                        <input
                          type="text"
                          value={act.text || ''}
                          onChange={(e) => handleUpdateAction(idx, { text: e.target.value })}
                          className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Alt Metin ({'{yorum}'})
                        </label>
                        <input
                          type="text"
                          value={act.subText || ''}
                          onChange={(e) => handleUpdateAction(idx, { subText: e.target.value })}
                          className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Süre (sn)</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={act.duration || 5}
                            onChange={(e) => handleUpdateAction(idx, { duration: Number(e.target.value) })}
                            className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Animasyon Efekti</label>
                          <select
                            value={act.animation || 'zoom'}
                            onChange={(e) => handleUpdateAction(idx, { animation: e.target.value })}
                            className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                          >
                            <option value="neon-pulse">🌟 Neon Parlama & Nabız (Cyberpunk Glow)</option>
                            <option value="flip-3d">🔄 3D Kart Döndürme (Flip In)</option>
                            <option value="elastic">⚡ Elastik Patlama (Elastic Pop)</option>
                            <option value="fire-burst">🔥 Alev & Cehennem Patlaması (Fire Burst)</option>
                            <option value="rainbow">🌈 Gökkuşağı / Holo Hediye (Rainbow)</option>
                            <option value="heartbeat">💓 Kalp Atışı Nabız (Heartbeat)</option>
                            <option value="glitch">👾 Siber Glitch (Cyberpunk Glitch)</option>
                            <option value="swirl">🌪️ Girdap / Dönen Giriş (Swirl In)</option>
                            <option value="rubberband">🎯 Lastik Gerilme (Rubberband)</option>
                            <option value="tada">🎉 Coşkulu Kutlama (Tada Fanfare)</option>
                            <option value="slide-left">➡️ Soldan Kayma (Slide Left)</option>
                            <option value="slide-right">⬅️ Sağdan Kayma (Slide Right)</option>
                            <option value="slide-up">⬆️ Alttan Yükselme (Slide Up)</option>
                            <option value="zoom">🔎 Büyüme (Zoom In)</option>
                            <option value="bounce">🏀 Sekerek Giriş (Bounce In)</option>
                            <option value="slide">⬇️ Üstten İniş (Slide Down)</option>
                            <option value="shake">📳 Sarsıntı & Titreme (Shake)</option>
                            <option value="fade">🌫️ Yumuşak Belirme (Fade In)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Media Action Form */}
                  {act.type === 'media' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Medya Kütüphanesinden Seç veya URL
                        </label>
                        <select
                          value={act.mediaUrl || ''}
                          onChange={(e) => handleUpdateAction(idx, { mediaUrl: e.target.value })}
                          className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                        >
                          <option value="">Medya Dosyası Seçin...</option>
                          {mediaList.map((m) => (
                            <option key={m.id} value={m.relativeUrl}>
                              {m.name} ({m.type.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Animasyon</label>
                          <select
                            value={act.animation || 'fade'}
                            onChange={(e) => handleUpdateAction(idx, { animation: e.target.value })}
                            className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                          >
                            <option value="fade">Yumuşak (Fade)</option>
                            <option value="zoom">Büyüyerek (Zoom)</option>
                            <option value="neon-pulse">Neon Patlama</option>
                            <option value="flip-3d">3D Döndürme</option>
                            <option value="elastic">Elastik Giriş</option>
                            <option value="fire-burst">Alevli Giriş</option>
                            <option value="glitch">Siber Glitch</option>
                            <option value="slide-up">Alttan Yükselme</option>
                          </select>
                        </div>
                        <div className="w-20">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Süre (sn)</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={act.duration || 5}
                            onChange={(e) => handleUpdateAction(idx, { duration: Number(e.target.value) })}
                            className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ses (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={act.volume !== undefined ? act.volume : 100}
                            onChange={(e) => handleUpdateAction(idx, { volume: Number(e.target.value) })}
                            className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sound Action Form */}
                  {act.type === 'sound' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Ses Dosyası (Dahili veya Kütüphane)
                        </label>
                        <select
                          value={act.soundUrl || ''}
                          onChange={(e) => handleUpdateAction(idx, { soundUrl: e.target.value })}
                          className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                        >
                          <option value="/default-sounds/tada.wav">🎉 Tada / Kutlama (Dahili)</option>
                          <option value="/default-sounds/pop.wav">🫧 Pop Sesi (Dahili)</option>
                          <option value="/default-sounds/bell.wav">🔔 Zil / Çan (Dahili)</option>
                          <option value="/default-sounds/laser.wav">⚡ Lazer / Efekt (Dahili)</option>
                          {mediaList
                            .filter((m) => m.type === 'audio')
                            .map((m) => (
                              <option key={m.id} value={m.relativeUrl}>
                                {m.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ses Seviyesi (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={act.volume || 80}
                          onChange={(e) => handleUpdateAction(idx, { volume: Number(e.target.value) })}
                          className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* TTS Action Form */}
                  {act.type === 'tts' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Okunacak Metin Şablonu
                      </label>
                      <input
                        type="text"
                        value={act.ttsTemplate || '{kullanici}: {yorum}'}
                        onChange={(e) => handleUpdateAction(idx, { ttsTemplate: e.target.value })}
                        className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Conflict & Advanced Controls */}
          <div className="p-4 bg-[#181E38] rounded-2xl border border-white/5 space-y-4">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
              3. Çakışma Yönetimi & Gelişmiş Kurallar
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Çakışma Modu (Conflict)
                </label>
                <select
                  value={formData.conflictMode || 'queue'}
                  onChange={(e) => setFormData({ ...formData, conflictMode: e.target.value })}
                  className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="queue">Sırayla Oynat (Queue)</option>
                  <option value="multi">Aynı Anda Üst Üste (Multi)</option>
                  <option value="interrupt">Öncekini Kes, Yenisini Oynat (Interrupt)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Bekleme Süresi / Cooldown (sn)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cooldownSec || 0}
                  onChange={(e) => setFormData({ ...formData, cooldownSec: Number(e.target.value) })}
                  className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Kullanıcı Başı Limit (sn)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.userLimitSec || 0}
                  onChange={(e) => setFormData({ ...formData, userLimitSec: Number(e.target.value) })}
                  className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.multiplier || false}
                  onChange={(e) => setFormData({ ...formData, multiplier: e.target.checked })}
                  className="rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-0 w-4 h-4"
                />
                <span>Hediye Adet Çarpanı (x3 gelirse 3 kez tekrarla)</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                if (automation?.id) testAutomation(automation.id);
              }}
              disabled={!automation?.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 text-xs font-bold transition disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Önizlemede Test Et</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 rounded-xl gradient-brand hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition"
              >
                <Save className="w-4 h-4" />
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
