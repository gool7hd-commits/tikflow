import React from 'react';
import { useApp } from '../store/AppContext';
import {
  Zap,
  Activity,
  Film,
  Monitor,
  Flame,
  Radio,
  ExternalLink,
  Users,
  Heart,
  Gem,
  Play,
  CheckCircle,
  Copy,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const {
    status,
    automations,
    mediaList,
    triggerSimulator,
    testOverlay,
    copyOverlayUrl,
    setActivePage,
    toggleAutomation
  } = useApp();

  const activeAutos = automations.filter((a) => a.aktif);
  const totalMedia = mediaList.length;
  const isObsConnected = (status.overlayClientCount || 0) > 0;
  const overlayUrl = `http://localhost:${status.port || 21420}/overlay`;

  // Quick Test Trigger Helpers
  const quickTestLion = () => {
    triggerSimulator({
      type: 'gift',
      user: { username: 'kral_destekci', nickname: 'Kral Destekçi 🦁' },
      gift: {
        id: 6059,
        name: 'Lion',
        turkishName: 'Aslan',
        diamonds: 29999,
        count: 1,
        icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'
      }
    });
  };

  const quickTestRose = () => {
    triggerSimulator({
      type: 'gift',
      user: { username: 'gül_sevdalisi', nickname: 'Gül Sever 🌹' },
      gift: {
        id: 5658,
        name: 'Rose',
        turkishName: 'Gül',
        diamonds: 1,
        count: 5,
        icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/rose.png~tplv-obj.png'
      }
    });
  };

  const quickTestGalaxy = () => {
    triggerSimulator({
      type: 'gift',
      user: { username: 'uzay_gezgini', nickname: 'Uzay Gezgini 🌌' },
      gift: {
        id: 5580,
        name: 'Galaxy',
        turkishName: 'Galaksi',
        diamonds: 1000,
        count: 1,
        icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/galaxy.png~tplv-obj.png'
      }
    });
  };

  const quickTestComment = () => {
    triggerSimulator({
      type: 'chat',
      user: { username: 'korku_adami', nickname: 'Korku Adamı 😱' },
      comment: 'KORKU'
    });
  };

  const quickTestLikes = () => {
    triggerSimulator({
      type: 'like',
      user: { username: 'parmak_hizli', nickname: 'Tıklayan Parmak' },
      likeCount: 1000
    });
  };

  const quickTestFollow = () => {
    triggerSimulator({
      type: 'follow',
      user: { username: 'yeni_takipci', nickname: 'Aramıza Yeni Katılan ✨' }
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-[#12172D] border border-purple-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Canlı Kontrol Merkezi</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              TikFlow ile Yayınınız Tam Otomatik!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              TikTok canlı yayınınızdaki hediyeler, beğeniler ve yorumlar anında özel editlerinizi,
              ses efektlerinizi ve animasyonlarınızı tetikler.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={copyOverlayUrl}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#181E36] hover:bg-[#202747] border border-white/10 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Copy className="w-4 h-4 text-cyan-400" />
              <span>Overlay Linkini Kopyala</span>
            </button>
            <button
              onClick={testOverlay}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl gradient-pink hover:opacity-90 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 active:scale-95"
            >
              <Play className="w-4 h-4 text-white" />
              <span>Overlay'i Test Et</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Automations */}
        <div className="p-5 rounded-2xl bg-[#13182C] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Aktif Otomasyonlar</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {activeAutos.length} <span className="text-sm text-slate-400 font-sans">/ {automations.length}</span>
          </div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Kural motoru devrede</span>
          </div>
        </div>

        {/* Card 2: Total Diamonds */}
        <div className="p-5 rounded-2xl bg-[#13182C] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gelen Jetonlar</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Gem className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-300 font-mono">
            {(status.counters?.totalDiamonds || 0).toLocaleString('tr-TR')} 💎
          </div>
          <div className="text-xs text-slate-400">
            En çok gönderen: {status.counters?.topGifters?.[0]?.nickname || 'Henüz yok'}
          </div>
        </div>

        {/* Card 3: Total Likes */}
        <div className="p-5 rounded-2xl bg-[#13182C] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Toplam Beğeniler</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-300 font-mono">
            {(status.counters?.totalLikes || 0).toLocaleString('tr-TR')}
          </div>
          <div className="text-xs text-slate-400">Canlı yayın etkileşimi</div>
        </div>

        {/* Card 4: OBS / Port Status */}
        <div className="p-5 rounded-2xl bg-[#13182C] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">OBS & Port</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-300 font-mono">
            :{status.port || 21420}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${isObsConnected ? 'bg-emerald-400' : 'bg-slate-500'}`}
            />
            <span>{isObsConnected ? 'OBS Tarayıcı Bağlı' : 'Bağlantı Bekleniyor'}</span>
          </div>
        </div>
      </div>

      {/* Quick Test Triggers Bar */}
      <div className="p-6 rounded-3xl bg-[#13182C] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-pink-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hızlı Test Tetikleyicileri
            </h3>
          </div>
          <span className="text-xs text-slate-400">Tek tıkla gerçek olay hattını test edin</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={quickTestLion}
            className="p-3 rounded-2xl bg-[#181E38] hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/40 text-left transition space-y-1.5 group"
          >
            <span className="text-xl">🦁</span>
            <div className="text-xs font-bold text-white group-hover:text-purple-300">1x Aslan</div>
            <div className="text-[10px] text-slate-400">29,999 💎 Testi</div>
          </button>

          <button
            onClick={quickTestRose}
            className="p-3 rounded-2xl bg-[#181E38] hover:bg-rose-900/30 border border-white/5 hover:border-rose-500/40 text-left transition space-y-1.5 group"
          >
            <span className="text-xl">🌹</span>
            <div className="text-xs font-bold text-white group-hover:text-rose-300">5x Gül</div>
            <div className="text-[10px] text-slate-400">Pop & Teşekkür</div>
          </button>

          <button
            onClick={quickTestGalaxy}
            className="p-3 rounded-2xl bg-[#181E38] hover:bg-indigo-900/30 border border-white/5 hover:border-indigo-500/40 text-left transition space-y-1.5 group"
          >
            <span className="text-xl">🌌</span>
            <div className="text-xs font-bold text-white group-hover:text-indigo-300">Galaksi</div>
            <div className="text-[10px] text-slate-400">1,000 💎 Uzay</div>
          </button>

          <button
            onClick={quickTestComment}
            className="p-3 rounded-2xl bg-[#181E38] hover:bg-amber-900/30 border border-white/5 hover:border-amber-500/40 text-left transition space-y-1.5 group"
          >
            <span className="text-xl">💬</span>
            <div className="text-xs font-bold text-white group-hover:text-amber-300">"KORKU" Yorumu</div>
            <div className="text-[10px] text-slate-400">Lazer / Korku</div>
          </button>

          <button
            onClick={quickTestLikes}
            className="p-3 rounded-2xl bg-[#181E38] hover:bg-red-900/30 border border-white/5 hover:border-red-500/40 text-left transition space-y-1.5 group"
          >
            <span className="text-xl">❤️</span>
            <div className="text-xs font-bold text-white group-hover:text-red-300">+1,000 Beğeni</div>
            <div className="text-[10px] text-slate-400">Eşik Kutlaması</div>
          </button>

          <button
            onClick={quickTestFollow}
            className="p-3 rounded-2xl bg-[#181E38] hover:bg-emerald-900/30 border border-white/5 hover:border-emerald-500/40 text-left transition space-y-1.5 group"
          >
            <span className="text-xl">👋</span>
            <div className="text-xs font-bold text-white group-hover:text-emerald-300">Yeni Takipçi</div>
            <div className="text-[10px] text-slate-400">Karşılama Uyarısı</div>
          </button>
        </div>
      </div>

      {/* Split Section: Mini Simulator & Automations Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automations Summary (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#13182C] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Otomasyon Özeti ({automations.length})</span>
            </h3>
            <button
              onClick={() => setActivePage('automations')}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <span>Tümünü Yönet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {automations.slice(0, 5).map((auto) => (
              <div
                key={auto.id}
                className="p-3.5 rounded-2xl bg-[#181E38] border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{auto.ad}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="capitalize text-purple-300">
                      {auto.tetikleyici?.type === 'gift'
                        ? '🎁 Hediye'
                        : auto.tetikleyici?.type === 'comment'
                        ? '💬 Yorum'
                        : auto.tetikleyici?.type === 'like'
                        ? '❤️ Beğeni'
                        : auto.tetikleyici?.type}
                    </span>
                    <span>•</span>
                    <span>{auto.aksiyonlar?.length || 0} Aksiyon</span>
                    <span>•</span>
                    <span className="text-[10px] font-mono uppercase bg-white/5 px-1.5 py-0.5 rounded">
                      {auto.conflictMode || 'queue'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAutomation(auto.id)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      auto.aktif ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        auto.aktif ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Stream Screen Simulator (1 Col) */}
        <div className="p-6 rounded-3xl bg-[#13182C] border border-white/5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Yayın Önizleme</span>
            </h3>
            <button
              onClick={() => setActivePage('screen')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
            >
              Düzenle
            </button>
          </div>

          <div className="flex-1 min-h-[300px] bg-[#0A0D18] rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center p-2">
            <iframe
              src={overlayUrl}
              title="Mini Overlay Preview"
              className="w-full h-full border-0 pointer-events-none rounded-xl"
            />
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Önizleme tuvali canlı overlay ile eşzamanlıdır.
          </div>
        </div>
      </div>
    </div>
  );
}
