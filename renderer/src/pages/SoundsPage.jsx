import React, { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import {
  Volume2,
  VolumeX,
  Upload,
  Play,
  Square,
  Trash2,
  Music,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export default function SoundsPage() {
  const { mediaList, uploadMedia, deleteMedia } = useApp();
  const fileInputRef = useRef(null);
  const [globalPreviewVolume, setGlobalPreviewVolume] = useState(80);
  const [activeAudioUrl, setActiveAudioUrl] = useState(null);
  const audioRef = useRef(null);

  // Built-in sounds
  const builtInSounds = [
    { id: 'builtin-tada', name: 'Tada / Kutlama Fanfarı', url: '/default-sounds/tada.wav', isBuiltIn: true },
    { id: 'builtin-pop', name: 'Pop Sesi', url: '/default-sounds/pop.wav', isBuiltIn: true },
    { id: 'builtin-bell', name: 'Zil / Çan Efekti', url: '/default-sounds/bell.wav', isBuiltIn: true },
    { id: 'builtin-laser', name: 'Lazer / Sci-Fi', url: '/default-sounds/laser.wav', isBuiltIn: true }
  ];

  // User uploaded audio
  const userAudios = mediaList.filter((m) => m.type === 'audio');

  const allSounds = [...builtInSounds, ...userAudios];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadMedia(file, file.name.replace(/\.[^/.]+$/, ''), 4);
    e.target.value = '';
  };

  const handlePlayToggle = (url) => {
    if (activeAudioUrl === url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setActiveAudioUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.volume = globalPreviewVolume / 100;
      audio.onended = () => setActiveAudioUrl(null);
      audio.play().catch(() => {});
      audioRef.current = audio;
      setActiveAudioUrl(url);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-cyan-400" />
            <span>Ses Efektleri Kütüphanesi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hediyeler, komutlar ve uyarılar ile tetiklenecek MP3 ve WAV ses dosyalarını yönetin.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/mp3,audio/wav,audio/ogg"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Yeni Ses Ekle (MP3 / WAV)</span>
          </button>
        </div>
      </div>

      {/* Global Preview Volume Slider */}
      <div className="p-4 bg-[#13182C] border border-white/5 rounded-2xl flex items-center justify-between gap-4 max-w-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Genel Önizleme Seviyesi:</span>
        </div>
        <div className="flex items-center gap-3 flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={globalPreviewVolume}
            onChange={(e) => {
              setGlobalPreviewVolume(Number(e.target.value));
              if (audioRef.current) audioRef.current.volume = Number(e.target.value) / 100;
            }}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-purple-300 w-10 text-right">
            %{globalPreviewVolume}
          </span>
        </div>
      </div>

      {/* Sounds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allSounds.map((snd) => {
          const url = snd.url || snd.relativeUrl;
          const isPlaying = activeAudioUrl === url;

          return (
            <div
              key={snd.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                isPlaying
                  ? 'bg-purple-900/30 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-[#13182C] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => handlePlayToggle(url)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition flex-shrink-0 ${
                    isPlaying
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-purple-300'
                  }`}
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate" title={snd.name}>
                    {snd.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    {snd.isBuiltIn ? 'Dahili Sistem Sesi' : url}
                  </div>
                </div>
              </div>

              {!snd.isBuiltIn && (
                <button
                  onClick={() => deleteMedia(snd.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
