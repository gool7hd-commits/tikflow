import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import {
  History,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function HistoryPage() {
  const { showToast } = useApp();
  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/history?limit=300');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Tüm geçmiş kayıtlarını silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setLogs([]);
      showToast('success', 'Geçmiş Temizlendi', 'Tüm olay kayıtları silindi.');
    } catch (e) {}
  };

  const handleDownloadCsv = () => {
    window.open('/api/history/csv', '_blank');
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <History className="w-6 h-6 text-purple-400" />
            <span>Olay & Tetiklenme Geçmişi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Yayın boyunca gerçekleşen tüm hediyeler, sohbet mesajları ve çalışan otomasyon kayıtları.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>CSV Olarak Dışa Aktar</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Geçmişi Temizle</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: `Tümü (${logs.length})` },
          { id: 'gift', label: `Hediyeler (${logs.filter((l) => l.type === 'gift').length})` },
          { id: 'chat', label: `Yorumlar (${logs.filter((l) => l.type === 'chat').length})` },
          { id: 'like', label: `Beğeniler (${logs.filter((l) => l.type === 'like').length})` },
          { id: 'follow', label: `Takipçiler (${logs.filter((l) => l.type === 'follow').length})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              filterType === t.id
                ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                : 'bg-[#13182C] border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-[#13182C] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E1326] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Zaman</th>
                <th className="py-3 px-4">Olay Tipi</th>
                <th className="py-3 px-4">Kullanıcı</th>
                <th className="py-3 px-4">Detay / İçerik</th>
                <th className="py-3 px-4">Çalışan Kural</th>
                <th className="py-3 px-4 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    Henüz hiçbir olay kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateStr = log.timestamp
                    ? new Date(log.timestamp).toLocaleTimeString('tr-TR')
                    : '-';

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{dateStr}</td>
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                            log.type === 'gift'
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                              : log.type === 'chat'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : log.type === 'like'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {log.user?.nickname || log.user?.username || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {log.gift ? (
                          <div className="flex items-center gap-1.5 font-bold text-pink-300">
                            <span>{log.gift.turkishName || log.gift.name}</span>
                            <span className="font-mono text-xs">x{log.gift.count || 1}</span>
                            <span className="text-slate-400 font-mono text-[11px]">({log.gift.diamonds} 💎)</span>
                          </div>
                        ) : log.comment ? (
                          <span className="text-slate-200">"{log.comment}"</span>
                        ) : log.likeCount ? (
                          <span className="text-red-300">+{log.likeCount} Beğeni</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-purple-300 font-medium">
                        {log.ruleName || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {log.status === 'triggered' || log.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Başarılı
                          </span>
                        ) : log.status === 'error' ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px]" title={log.error}>
                            <AlertCircle className="w-3.5 h-3.5" /> Hata
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">İşlendi</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
