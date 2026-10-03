import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import AutomationModal from '../components/AutomationModal';
import EventModal from '../components/EventModal';
import ActionModal from '../components/ActionModal';
import {
  Zap,
  Plus,
  Search,
  Filter,
  Play,
  Edit2,
  CopyPlus,
  Trash2,
  Power,
  Layers,
  Clock,
  Sparkles,
  Film
} from 'lucide-react';

export default function AutomationsPage() {
  const {
    automations,
    actions,
    fetchActions,
    toggleAutomation,
    toggleAllAutomations,
    testAutomation,
    duplicateAutomation,
    deleteAutomation
  } = useApp();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [editingAuto, setEditingAuto] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [legacyModalOpen, setLegacyModalOpen] = useState(false);

  // Filter automations
  const filtered = automations.filter((a) => {
    const matchesSearch =
      a.ad.toLowerCase().includes(search.toLowerCase()) ||
      (a.tetikleyici?.type && a.tetikleyici.type.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === 'active') return a.aktif;
    if (filter === 'inactive') return !a.aktif;
    return true;
  });

  const allActive = automations.length > 0 && automations.every((a) => a.aktif);

  const handleCreateEvent = () => {
    setEditingAuto(null);
    setEventModalOpen(true);
  };

  const handleCreateAction = () => {
    setActionModalOpen(true);
  };

  const handleEdit = (auto) => {
    setEditingAuto(auto);
    setEventModalOpen(true);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-400" />
            <span>Otomasyon & Etkinlik Kuralları</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Yayın olaylarına bağlı tetikleyiciler, edit videoları, ses ve uyarı eylemleri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleAllAutomations(!allActive)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
              allActive
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{allActive ? 'Tümünü Kapat' : 'Tümünü Aç'}</span>
          </button>

          <button
            onClick={handleCreateAction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A223D] hover:bg-[#222C4E] border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-lg transition active:scale-95"
            title="Video, Ses veya Uyarı Eylemi Tanımlayın"
          >
            <Film className="w-4 h-4 text-cyan-400" />
            <span>Yeni Eylem Ekle</span>
          </button>

          <button
            onClick={handleCreateEvent}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand hover:opacity-90 text-white text-xs font-black shadow-lg shadow-purple-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Etkinlik Ekle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#13182C] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `Tümü (${automations.length})` },
            { id: 'active', label: `Aktif (${automations.filter((a) => a.aktif).length})` },
            { id: 'inactive', label: `Kapalı (${automations.filter((a) => !a.aktif).length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                filter === tab.id
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                  : 'bg-[#181E38] border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Otomasyon kuralı ara..."
            className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm bg-[#13182C] rounded-2xl border border-white/5">
            Eşleşen otomasyon bulunamadı.
          </div>
        ) : (
          filtered.map((auto) => {
            const trgType = auto.tetikleyici?.type || 'gift';
            const actionCount = auto.aksiyonlar?.length || 0;

            return (
              <div
                key={auto.id}
                className="p-5 rounded-2xl bg-[#13182C] border border-white/5 hover:border-white/10 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleAutomation(auto.id)}
                    className={`mt-1 w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                      auto.aktif ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        auto.aktif ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-white">{auto.ad}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-white/5 text-slate-400">
                        {auto.conflictMode || 'queue'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                      <span className="text-purple-300 font-semibold">
                        Tetikleyici:{' '}
                        {trgType === 'gift'
                          ? `🎁 Hediye (${auto.tetikleyici?.config?.turkishName || auto.tetikleyici?.config?.giftName || 'Herhangi'})`
                          : trgType === 'comment'
                          ? `💬 Yorum ("${auto.tetikleyici?.config?.keyword}")`
                          : trgType === 'like'
                          ? `❤️ Her ${auto.tetikleyici?.config?.step || 1000} Beğeni`
                          : trgType === 'follow'
                          ? '👋 Yeni Takipçi'
                          : trgType}
                      </span>
                      <span>•</span>
                      <span>{actionCount} Aksiyon</span>
                      {auto.cooldownSec > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-400">
                            <Clock className="w-3 h-3" /> {auto.cooldownSec}s Bekleme
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => testAutomation(auto.id)}
                    className="p-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 transition"
                    title="Bu Kuralı Test Et"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateAutomation(auto.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    title="Kopyala"
                  >
                    <CopyPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(auto)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAutomation(auto.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Event Modal */}
      {eventModalOpen && (
        <EventModal
          eventItem={editingAuto}
          isOpen={true}
          onClose={() => {
            setEventModalOpen(false);
            setEditingAuto(null);
          }}
        />
      )}

      {/* Action Modal */}
      {actionModalOpen && (
        <ActionModal
          isOpen={true}
          onClose={() => setActionModalOpen(false)}
          onSave={() => fetchActions()}
        />
      )}

      {/* Legacy Automation Modal */}
      {legacyModalOpen && (
        <AutomationModal
          automation={editingAuto}
          onClose={() => {
            setLegacyModalOpen(false);
            setEditingAuto(null);
          }}
        />
      )}
    </div>
  );
}
