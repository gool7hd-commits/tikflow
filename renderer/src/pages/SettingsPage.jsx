import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Tv,
  Mic,
  Shield,
  Monitor,
  CheckCircle2,
  Radio
} from 'lucide-react';

export default function SettingsPage() {
  const { status, showToast, fetchStatus } = useApp();
  const fileInputRef = useRef(null);

  const [settings, setSettings] = useState({
    port: 21420,
    layout: 'vertical', // 'vertical' | 'horizontal'
    defaultVolume: 80,
    ttsEnabled: true,
    ttsVoice: 'tr-TR',
    ttsRate: 1.0,
    autoConnectOnStart: false,
    defaultUsername: '',
    copyMedia: true,
    theme: 'dark'
  });

  const [obsConfig, setObsConfig] = useState({
    address: 'ws://127.0.0.1:4455',
    password: ''
  });
  const [obsConnected, setObsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkObs();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {}
  };

  const checkObs = async () => {
    try {
      const res = await fetch('/api/obs/status');
      if (res.ok) {
        const data = await res.json();
        setObsConnected(data.connected);
      }
    } catch (e) {}
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('success', 'Ayarlar Kaydedildi', 'Tüm sistem ve overlay ayarları güncellendi.');
        fetchStatus();
      }
    } catch (e) {
      showToast('error', 'Hata', 'Ayarlar kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectObs = async () => {
    try {
      const res = await fetch('/api/obs/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obsConfig)
      });
      const data = await res.json();
      setObsConnected(data.connected);
      if (data.connected) {
        showToast('success', 'OBS Bağlandı', 'OBS Studio WebSocket v5 bağlantısı sağlandı.');
      } else {
        showToast('error', 'OBS Bağlantı Hatası', 'OBS WebSocket portunu ve şifrenizi kontrol edin.');
      }
    } catch (e) {
      showToast('error', 'Hata', e.message);
    }
  };

  const handleBackup = () => {
    window.open('/api/settings/backup', '_blank');
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/settings/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsed })
      });
      if (res.ok) {
        showToast('success', 'Yedek Yüklendi', 'Tüm veriler ve otomasyonlar başarıyla geri yüklendi.');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      showToast('error', 'Hata', 'Geçersiz yedek dosyası.');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Settings className="w-6 h-6 text-purple-400" />
            <span>Sistem & Uygulama Ayarları</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overlay yönü, port yönetimi, TTS ve OBS Studio entegrasyonu.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-brand hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Overlay & Canvas Settings */}
        <div className="p-6 bg-[#13182C] border border-white/5 rounded-3xl space-y-4">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span>1. Overlay Ekran & Çözünürlük</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Varsayılan Tuval Yönü
              </label>
              <select
                value={settings.layout || 'vertical'}
                onChange={(e) => setSettings({ ...settings, layout: e.target.value })}
                className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
              >
                <option value="vertical">Dikey (1080 × 1920) – TikTok LIVE & Telefon Standardı</option>
                <option value="horizontal">Yatay (1920 × 1080) – Klasik PC / YouTube 16:9</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                İpucu: OBS Browser Source linkine <code className="text-purple-300">?layout=vertical</code> veya <code className="text-purple-300">?layout=horizontal</code> parametresi ekleyerek de belirleyebilirsiniz.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sunucu Port Numarası
              </label>
              <input
                type="number"
                value={settings.port || 21420}
                onChange={(e) => setSettings({ ...settings, port: Number(e.target.value) })}
                className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Varsayılan: 21420. Doluysa uygulama otomatik olarak sıradaki boş porta geçer.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Audio & TTS Settings */}
        <div className="p-6 bg-[#13182C] border border-white/5 rounded-3xl space-y-4">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <Mic className="w-4 h-4" />
            <span>2. Ses & TTS (Metin Seslendirme) Ayarları</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Varsayılan Genel Ses (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.defaultVolume !== undefined ? settings.defaultVolume : 80}
                onChange={(e) => setSettings({ ...settings, defaultVolume: Number(e.target.value) })}
                className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                TTS Dili / Ses
              </label>
              <select
                value={settings.ttsVoice || 'tr-TR'}
                onChange={(e) => setSettings({ ...settings, ttsVoice: e.target.value })}
                className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
              >
                <option value="tr-TR">Türkçe (tr-TR)</option>
                <option value="en-US">İngilizce (en-US)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                TTS Konuşma Hızı
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="2.0"
                value={settings.ttsRate || 1.0}
                onChange={(e) => setSettings({ ...settings, ttsRate: Number(e.target.value) })}
                className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. OBS Studio WebSocket v5 */}
        <div className="p-6 bg-[#13182C] border border-white/5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Tv className="w-4 h-4" />
              <span>3. OBS Studio WebSocket v5 Entegrasyonu</span>
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                obsConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${obsConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{obsConnected ? 'OBS Bağlı' : 'Bağlı Değil'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                OBS WebSocket Adresi
              </label>
              <input
                type="text"
                value={obsConfig.address}
                onChange={(e) => setObsConfig({ ...obsConfig, address: e.target.value })}
                className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                OBS WebSocket Şifresi
              </label>
              <input
                type="password"
                placeholder="OBS'te belirlenen şifre"
                value={obsConfig.password}
                onChange={(e) => setObsConfig({ ...obsConfig, password: e.target.value })}
                className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectObs}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
          >
            {obsConnected ? 'OBS Bağlantısını Yenile' : 'OBS Studio\'ya Bağlan'}
          </button>
        </div>

        {/* 4. Backup & Restore */}
        <div className="p-6 bg-[#13182C] border border-white/5 rounded-3xl space-y-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>4. Veri Yedekleme & Geri Yükleme (JSON)</span>
          </span>
          <p className="text-xs text-slate-400">
            Tüm otomasyonlarınızı, hediye ayarlarınızı, profillerinizi ve tuval yerleşimlerinizi tek bir JSON dosyası olarak kaydedebilir veya geri yükleyebilirsiniz.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackup}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181E38] hover:bg-purple-900/30 border border-white/10 text-xs font-bold text-white transition"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Yedeği İndir (JSON)</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestoreFile}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181E38] hover:bg-pink-900/30 border border-white/10 text-xs font-bold text-white transition"
            >
              <Upload className="w-4 h-4 text-pink-400" />
              <span>Yedekten Geri Yükle</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
