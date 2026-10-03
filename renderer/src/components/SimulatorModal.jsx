import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { TIKTOK_GIFTS } from '../../../shared/giftCatalog.js';
import {
  Flame,
  X,
  Send,
  Heart,
  UserPlus,
  Share2,
  Search,
  Sparkles,
  Info
} from 'lucide-react';

export default function SimulatorModal() {
  const { simulatorOpen, setSimulatorOpen, triggerSimulator } = useApp();

  const [username, setUsername] = useState('Ahmet_Kral23');
  const [commentText, setCommentText] = useState('Harika yayın! KORKU');
  const [giftSearch, setGiftSearch] = useState('');
  const [selectedGift, setSelectedGift] = useState(TIKTOK_GIFTS[1]); // Lion
  const [giftCount, setGiftCount] = useState(1);
  const [likeCountInput, setLikeCountInput] = useState(100);

  if (!simulatorOpen) return null;

  const filteredGifts = TIKTOK_GIFTS.filter(
    (g) =>
      g.name.toLowerCase().includes(giftSearch.toLowerCase()) ||
      g.turkishName.toLowerCase().includes(giftSearch.toLowerCase())
  );

  const handleSendGift = () => {
    if (!selectedGift) return;
    triggerSimulator({
      type: 'gift',
      user: {
        id: 'sim-' + username,
        username: username,
        nickname: `${username} 👑`,
        avatar: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
      },
      gift: {
        ...selectedGift,
        count: Number(giftCount) || 1,
        totalDiamonds: selectedGift.diamonds * (Number(giftCount) || 1)
      }
    });
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    triggerSimulator({
      type: 'chat',
      user: {
        id: 'sim-' + username,
        username: username,
        nickname: username,
        avatar: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
      },
      comment: commentText.trim()
    });
  };

  const handleSendLikes = (amount) => {
    triggerSimulator({
      type: 'like',
      user: {
        id: 'sim-' + username,
        username: username,
        nickname: username,
        avatar: ''
      },
      likeCount: Number(amount)
    });
  };

  const handleSendFollow = () => {
    triggerSimulator({
      type: 'follow',
      user: {
        id: 'sim-' + username,
        username: username,
        nickname: `${username} ✨`,
        avatar: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
      }
    });
  };

  const handleSendShare = () => {
    triggerSimulator({
      type: 'share',
      user: {
        id: 'sim-' + username,
        username: username,
        nickname: username,
        avatar: ''
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#12172D] border border-pink-500/40 w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-pink flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Hızlı Test & Olay Simülatörü
              </h2>
              <p className="text-xs text-slate-400">
                Gerçek TikTok olaylarını simüle ederek otomasyon ve overlay tepkilerini anında test edin.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSimulatorOpen(false)}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sender Viewer Name */}
        <div className="py-4 border-b border-white/5 flex items-center gap-4">
          <label className="text-xs font-bold text-slate-300 whitespace-nowrap">
            Gönderen İzleyici:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
            placeholder="Kullanıcı adı girin..."
          />
        </div>

        {/* Body Sections */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* 1. Gift Simulator */}
          <div className="p-4 bg-[#181E38] rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Hediye Simülatörü
              </span>
              {selectedGift && (
                <span className="text-xs font-semibold text-emerald-400">
                  Seçili: {selectedGift.turkishName} ({selectedGift.diamonds} 💎)
                </span>
              )}
            </div>

            {/* Gift Search & Grid */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={giftSearch}
                onChange={(e) => setGiftSearch(e.target.value)}
                placeholder="Hediye ara (Aslan, Gül, Galaksi...)"
                className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
              {filteredGifts.slice(0, 24).map((g) => {
                const isSel = selectedGift?.id === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGift(g)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition ${
                      isSel
                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-md'
                        : 'bg-[#101426] border-white/5 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <img src={g.icon} alt={g.name} className="w-9 h-9 object-contain mb-1" />
                    <span className="text-[11px] font-bold truncate w-full">{g.turkishName}</span>
                    <span className="text-[10px] text-pink-300 font-mono">{g.diamonds} 💎</span>
                  </button>
                );
              })}
            </div>

            {/* Count & Send */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-semibold">Adet:</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={giftCount}
                  onChange={(e) => setGiftCount(e.target.value)}
                  className="w-20 bg-[#0B0E1A] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white text-center font-bold font-mono focus:outline-none focus:border-pink-500"
                />
              </div>
              <button
                onClick={handleSendGift}
                className="flex items-center gap-2 px-5 py-2 rounded-xl gradient-pink hover:opacity-90 text-xs font-bold text-white shadow-md transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hediyeyi Gönder ({selectedGift ? selectedGift.turkishName : ''} x{giftCount})</span>
              </button>
            </div>
          </div>

          {/* 2. Comment Simulator */}
          <div className="p-4 bg-[#181E38] rounded-2xl border border-white/5 space-y-3">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
              💬 İzleyici Yorumu Simüle Et
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Yorum metni girin..."
                className="flex-1 bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleSendComment}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Yorum Gönder</span>
              </button>
            </div>
          </div>

          {/* 3. Likes, Follow & Share */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Likes */}
            <div className="p-4 bg-[#181E38] rounded-2xl border border-white/5 space-y-3">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400" />
                Beğeni Simülatörü
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={likeCountInput}
                  onChange={(e) => setLikeCountInput(e.target.value)}
                  className="w-24 bg-[#0B0E1A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => handleSendLikes(likeCountInput)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Beğeni Ekle</span>
                </button>
              </div>
              <button
                onClick={() => handleSendLikes(1000)}
                className="w-full py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-sm"
              >
                +1,000 Beğeni (Eşik Testi)
              </button>
            </div>

            {/* Follow & Share */}
            <div className="p-4 bg-[#181E38] rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Takipçi & Paylaşım
              </span>
              <div className="space-y-2">
                <button
                  onClick={handleSendFollow}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Yeni Takipçi Simüle Et</span>
                </button>
                <button
                  onClick={handleSendShare}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Yayını Paylaş Simüle Et</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Info className="w-4 h-4" />
            <span>Olaylar anında aktif overlay'e ve OBS bağlantısına iletilir.</span>
          </div>
          <button
            onClick={() => setSimulatorOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
