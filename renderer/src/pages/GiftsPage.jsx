import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import AutomationModal from '../components/AutomationModal';
import {
  Gift,
  Search,
  Filter,
  Zap,
  CheckCircle2,
  Plus,
  Play,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export default function GiftsPage() {
  const { automations, triggerSimulator } = useApp();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tümü');
  const [modalGift, setModalGift] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gifts?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
      if (res.ok) {
        const data = await res.json();
        setGifts(data);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, [search, category, automations]);

  const categories = ['Tümü', 'Ultra Lüks', 'Lüks', 'Popüler', 'Klasik'];

  const handleQuickConnectEdit = (gift) => {
    // Open automation modal pre-filled with this gift
    const template = {
      ad: `${gift.turkishName} Hediyesi - Özel Edit`,
      aktif: true,
      conflictMode: 'queue',
      cooldownSec: 2,
      tetikleyici: {
        type: 'gift',
        config: {
          matchType: 'specific',
          giftName: gift.name,
          turkishName: gift.turkishName,
          minDiamonds: gift.diamonds,
          minCount: 1,
          onlyStreakEnd: true
        }
      },
      aksiyonlar: [
        {
          id: 'act-' + Date.now(),
          type: 'alert',
          text: `🎉 {kullanici} ${gift.turkishName} gönderdi x{adet}!`,
          subText: `${gift.diamonds} Jetonluk Muazzam Destek!`,
          duration: 5,
          animation: 'zoom',
          location: 'center'
        },
        {
          id: 'act-' + (Date.now() + 1),
          type: 'sound',
          soundUrl: '/default-sounds/tada.wav',
          volume: 85
        }
      ]
    };
    setModalGift(template);
    setEditModalOpen(true);
  };

  const handleTestGift = (gift) => {
    triggerSimulator({
      type: 'gift',
      user: { username: 'test_hediyeci', nickname: 'Cömert Dost 🎁' },
      gift: {
        id: gift.id,
        name: gift.name,
        turkishName: gift.turkishName,
        diamonds: gift.diamonds,
        count: 1,
        icon: gift.icon
      }
    });
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Gift className="w-6 h-6 text-pink-400" />
            <span>TikTok Hediye Kataloğu</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tüm TikTok hediyeleri, gerçek değerleri ve Türkçe eşlemeleriyle. Her hediyeye tek tıkla özel edit bağlayabilirsiniz.
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#13182C] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                category === cat
                  ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-sm'
                  : 'bg-[#181E38] border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hediye adı veya Türkçe ara..."
            className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Gifts Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {gifts.map((gift) => (
            <div
              key={gift.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group ${
                gift.hasAutomation
                  ? 'bg-[#161C36] border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'bg-[#13182C] border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                {/* Gift Top Badges */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-400 uppercase">
                    {gift.category}
                  </span>
                  {gift.hasAutomation && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-purple-400" />
                      <span>Aktif</span>
                    </span>
                  )}
                </div>

                {/* Gift Icon & Names */}
                <div className="flex flex-col items-center py-2 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#0B0E1A] flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform duration-200 border border-white/5 shadow-inner">
                    <img
                      src={gift.icon}
                      alt={gift.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-extrabold text-sm text-white truncate w-full" title={gift.turkishName}>
                    {gift.turkishName}
                  </h3>
                  <div className="text-[11px] text-slate-400 truncate w-full" title={gift.name}>
                    {gift.name}
                  </div>
                  <div className="text-xs font-mono font-bold text-pink-400 mt-1">
                    {gift.diamonds.toLocaleString('tr-TR')} 💎
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/5 space-y-1.5 mt-2">
                <button
                  onClick={() => handleQuickConnectEdit(gift)}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    gift.hasAutomation
                      ? 'bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{gift.hasAutomation ? 'Kuralı Düzenle' : '+ Edit Bağla'}</span>
                </button>

                <button
                  onClick={() => handleTestGift(gift)}
                  className="w-full py-1 px-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-[11px] font-semibold transition flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Test Et</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Automation Edit Modal */}
      {editModalOpen && (
        <AutomationModal
          automation={modalGift}
          onClose={() => {
            setEditModalOpen(false);
            setModalGift(null);
          }}
        />
      )}
    </div>
  );
}
