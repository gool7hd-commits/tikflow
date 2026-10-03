import React, { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import {
  FolderOpen,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Film,
  Image as ImageIcon,
  Volume2,
  FileQuestion,
  RefreshCw
} from 'lucide-react';

export default function MediaLibraryPage() {
  const { mediaList, uploadMedia, deleteMedia, showToast } = useApp();
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState('all'); // 'all' | 'video' | 'image' | 'audio'
  const [search, setSearch] = useState('');
  const [isCheckingFiles, setIsCheckingFiles] = useState(false);
  const [missingReport, setMissingReport] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadMedia(file, file.name.replace(/\.[^/.]+$/, ''), 5);
    e.target.value = '';
  };

  const handleCheckMissing = async () => {
    setIsCheckingFiles(true);
    try {
      const res = await fetch('/api/media/check');
      if (res.ok) {
        const data = await res.json();
        setMissingReport(data);
        const missingCount = data.filter((m) => !m.exists).length;
        if (missingCount === 0) {
          showToast('success', 'Dosyalar Tam', 'Tüm medya dosyaları disk üzerinde eksiksiz mevcut.');
        } else {
          showToast('warning', 'Eksik Dosya Tespit Edildi', `${missingCount} dosya bulunamadı!`);
        }
      }
    } catch (e) {
      showToast('error', 'Hata', 'Dosyalar kontrol edilemedi.');
    } finally {
      setIsCheckingFiles(false);
    }
  };

  const filtered = mediaList.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (tab === 'video') return m.type === 'video';
    if (tab === 'image') return m.type === 'image' || m.type === 'gif';
    if (tab === 'audio') return m.type === 'audio';
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-purple-400" />
            <span>Medya Kütüphanesi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Yayınlarınızda kullanılan tüm videolar, GIF'ler, resimler ve ses efektleri tek bir merkezde.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckMissing}
            disabled={isCheckingFiles}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingFiles ? 'animate-spin' : ''}`} />
            <span>Dosyaları Kontrol Et</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Dosya Yükle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#13182C] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `Tümü (${mediaList.length})` },
            { id: 'video', label: `Videolar (${mediaList.filter((m) => m.type === 'video').length})` },
            { id: 'image', label: `GIF & Resim (${mediaList.filter((m) => m.type === 'image' || m.type === 'gif').length})` },
            { id: 'audio', label: `Sesler (${mediaList.filter((m) => m.type === 'audio').length})` }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                tab === t.id
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                  : 'bg-[#181E38] border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Dosya adı ara..."
            className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Missing report alert banner if present */}
      {missingReport && missingReport.some((m) => !m.exists) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              Bazı dosyalar taşınmış veya silinmiş görünüyor. Lütfen bu dosyaları yeniden yükleyin veya kural bağlantılarını güncelleyin.
            </span>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const report = missingReport?.find((r) => r.id === item.id);
          const isMissing = report ? !report.exists : false;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                isMissing
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-[#13182C] border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-white/5 text-purple-300">
                    {item.type}
                  </span>
                  {isMissing ? (
                    <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Eksik Dosya
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Hazır
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-xs text-white truncate" title={item.name}>
                  {item.name}
                </h3>
                <div className="text-[10px] text-slate-400 font-mono truncate mt-1">
                  {item.relativeUrl}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-3 text-xs text-slate-400">
                <span className="font-mono text-[11px]">
                  {(item.size ? (item.size / (1024 * 1024)).toFixed(1) : 0)} MB
                </span>
                <button
                  onClick={() => deleteMedia(item.id)}
                  className="p-1 hover:text-rose-400 transition"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
