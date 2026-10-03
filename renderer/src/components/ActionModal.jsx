import React, { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import {
  X,
  Upload,
  Check,
  Film,
  Volume2,
  Bell,
  Mic,
  MessageSquare,
  Tv,
  Eye,
  Sliders,
  Sparkles,
  Trash2
} from 'lucide-react';

export default function ActionModal({ action, isOpen, onClose, onSave }) {
  const { uploadMedia, mediaList, showToast } = useApp();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(action?.name || '');
  const [types, setTypes] = useState({
    animation: false,
    imageGif: false,
    sound: false,
    video: true, // Default to video per screenshot
    alert: false,
    tts: false,
    chatbot: false,
    obsScene: false,
    obsSource: false
  });

  const [videoFile, setVideoFile] = useState(action?.videoUrl || '');
  const [videoFileName, setVideoFileName] = useState(action?.videoFileName || '');
  const [videoDuration, setVideoDuration] = useState(action?.duration || 6);
  const [videoVolume, setVideoVolume] = useState(action?.volume !== undefined ? action?.volume : 100);

  const [alertText, setAlertText] = useState(action?.alertText || '🎉 {kullanici} {hediye} gönderdi!');
  const [alertSubText, setAlertSubText] = useState(action?.alertSubText || 'Özel edit yayında!');
  const [soundUrl, setSoundUrl] = useState(action?.soundUrl || '/default-sounds/tada.wav');
  const [ttsText, setTtsText] = useState(action?.ttsText || '{kullanici}: {yorum}');
  const [chatbotMsg, setChatbotMsg] = useState(action?.chatbotMsg || 'Teşekkürler @{kullanici}!');
  const [obsSceneName, setObsSceneName] = useState(action?.obsSceneName || '');
  const [obsSourceName, setObsSourceName] = useState(action?.obsSourceName || '');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const uploaded = await uploadMedia(file, file.name.replace(/\.[^/.]+$/, ''), videoDuration);
    setIsUploading(false);
    if (uploaded) {
      setVideoFile(uploaded.relativeUrl);
      setVideoFileName(uploaded.originalName || file.name);
      if (!name) setName(uploaded.name);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Hata', 'Lütfen eylemin adını girin.');
      return;
    }

    const payload = {
      id: action?.id || 'act-' + Date.now(),
      name: name.trim(),
      types,
      videoUrl: videoFile,
      videoFileName,
      duration: Number(videoDuration) || 6,
      volume: Number(videoVolume),
      alertText,
      alertSubText,
      soundUrl,
      ttsText,
      chatbotMsg,
      obsSceneName,
      obsSourceName
    };

    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('success', 'Eylem Kaydedildi', `"${payload.name}" eylemi başarıyla oluşturuldu.`);
        if (onSave) onSave(payload);
        onClose();
      }
    } catch (err) {
      showToast('error', 'Hata', 'Eylem kaydedilemedi.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1E24] border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col text-slate-200 select-none">
        {/* Header matching screenshot */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Yeni Eylem</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
          {/* Eylemin adı nedir? */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Eylemin adı nedir?
            </label>
            <input
              type="text"
              required
              placeholder="Örn: gaal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#12141A] border border-white/10 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
            />
          </div>

          {/* Ne olmalı? (birden fazla seçenek seçilebilir) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Ne olmalı? (birden fazla seçenek seçilebilir)
            </label>

            {/* Checkbox: Animasyonu Göster */}
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={types.animation}
                onChange={(e) => setTypes({ ...types, animation: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-[#12141A] accent-cyan-500"
              />
              <span>Animasyonu Göster</span>
            </label>

            {/* Checkbox: Resim / GIF Göster */}
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={types.imageGif}
                onChange={(e) => setTypes({ ...types, imageGif: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-[#12141A] accent-cyan-500"
              />
              <span>Resim / GIF Göster</span>
            </label>

            {/* Checkbox: Sesi Çal */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={types.sound}
                  onChange={(e) => setTypes({ ...types, sound: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-[#12141A] accent-cyan-500"
                />
                <span>Sesi Çal</span>
              </label>

              {types.sound && (
                <div className="ml-7 p-2.5 bg-[#12141A] rounded-xl border border-white/5 space-y-2">
                  <select
                    value={soundUrl}
                    onChange={(e) => setSoundUrl(e.target.value)}
                    className="w-full bg-[#1C1E24] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="/default-sounds/tada.wav">🎉 Tada Kutlama</option>
                    <option value="/default-sounds/bell.wav">🔔 Zil / Çan</option>
                    <option value="/default-sounds/pop.wav">🫧 Pop Sesi</option>
                    <option value="/default-sounds/laser.wav">⚡ Lazer Efekti</option>
                    {mediaList.filter(m => m.type === 'audio').map(a => (
                      <option key={a.id} value={a.relativeUrl}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Checkbox: Video Dosyasını Oynat (CHECKED AS IN SCREENSHOT) */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-white">
                <input
                  type="checkbox"
                  checked={types.video}
                  onChange={(e) => setTypes({ ...types, video: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-[#12141A] accent-cyan-500"
                />
                <span>Video Dosyasını Oynat</span>
              </label>

              {types.video && (
                <div className="ml-7 p-4 bg-[#12141A] rounded-xl border border-white/5 space-y-3">
                  {/* Select file or drop file here matching screenshot */}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#262A36] hover:bg-[#313645] border border-white/10 rounded-lg text-xs font-bold text-white transition flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isUploading ? 'Yükleniyor...' : 'Select file'}</span>
                    </button>
                    <span className="text-xs text-slate-400">or Drop file here</span>
                  </div>

                  {/* Selected file item box with remove cross matching screenshot */}
                  {videoFileName && (
                    <div className="flex items-center justify-between p-2.5 bg-[#1C1E24] border border-white/10 rounded-lg text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Film className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span className="truncate text-white font-mono">{videoFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile('');
                          setVideoFileName('');
                        }}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-rose-400 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Recommended format note matching screenshot */}
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dosya desteklenmiyorsa, çok büyükse veya oynatılamıyorsa, dosyayı uyumlu bir biçime dönüştürmek için{' '}
                    <a
                      href="https://www.freeconvert.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline"
                    >
                      freeconvert.com
                    </a>{' '}
                    adresini kullanın. Önerilen biçim, <span className="font-bold text-slate-300">H264</span> kodek (akışlı) ile <span className="font-bold text-slate-300">MP4</span>'tür.
                  </p>

                  {/* Duration & Volume Controls */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Süre: {videoDuration} sn
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Ses: %{videoVolume}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={videoVolume}
                        onChange={(e) => setVideoVolume(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox: Uyarıyı Göster (Kullanıcı + Metin) */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={types.alert}
                  onChange={(e) => setTypes({ ...types, alert: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-[#12141A] accent-cyan-500"
                />
                <span>Uyarıyı Göster (Kullanıcı + Metin)</span>
              </label>

              {types.alert && (
                <div className="ml-7 p-3 bg-[#12141A] rounded-xl border border-white/5 space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Başlık Metni</label>
                    <input
                      type="text"
                      value={alertText}
                      onChange={(e) => setAlertText(e.target.value)}
                      className="w-full bg-[#1C1E24] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Alt Metin</label>
                    <input
                      type="text"
                      value={alertSubText}
                      onChange={(e) => setAlertSubText(e.target.value)}
                      className="w-full bg-[#1C1E24] border border-white/10 rounded px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox: Metni Oku (TTS) */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={types.tts}
                  onChange={(e) => setTypes({ ...types, tts: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-[#12141A] accent-cyan-500"
                />
                <span>Metni Oku (TTS)</span>
              </label>

              {types.tts && (
                <div className="ml-7 p-3 bg-[#12141A] rounded-xl border border-white/5">
                  <input
                    type="text"
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="{kullanici}: {yorum}"
                    className="w-full bg-[#1C1E24] border border-white/10 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Checkbox: Chatbot Mesajı Gönder */}
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={types.chatbot}
                onChange={(e) => setTypes({ ...types, chatbot: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-[#12141A] accent-cyan-500"
              />
              <span>Chatbot Mesajı Gönder</span>
            </label>

            {/* Checkbox: Switch OBS Sahnesi */}
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={types.obsScene}
                onChange={(e) => setTypes({ ...types, obsScene: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-[#12141A] accent-cyan-500"
              />
              <span>Switch OBS Sahnesi</span>
            </label>

            {/* Checkbox: OBS Kaynağını Etkinleştir */}
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={types.obsSource}
                onChange={(e) => setTypes({ ...types, obsSource: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-[#12141A] accent-cyan-500"
              />
              <span>OBS Kaynağını Etkinleştir</span>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              Eylemi Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
