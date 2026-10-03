import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { TIKTOK_GIFTS } from '../../../shared/giftCatalog.js';
import ActionModal from './ActionModal';
import {
  X,
  UserCheck,
  Shield,
  Crown,
  User,
  Users,
  LogIn,
  Sparkles,
  Share2,
  UserPlus,
  Heart,
  MessageSquare,
  Terminal,
  Coins,
  Gift,
  Plus,
  Check,
  Search,
  Shuffle,
  Clock,
  Film,
  Volume2,
  Bell,
  Mic
} from 'lucide-react';

const ACTOR_OPTIONS = [
  { id: 'subscriber', label: 'Herhangi bir Abone', icon: UserCheck, desc: 'Yalnızca kanala abone olanlar' },
  { id: 'moderator', label: 'Herhangi bir Moderatör', icon: Shield, desc: 'Yalnızca moderatörler' },
  { id: 'top_gifter', label: 'En İyi Hediye Veren', icon: Crown, desc: 'Yayının en çok hediye gönderen 1. kişisi' },
  { id: 'specific_user', label: 'Belirli bir Kullanıcı', icon: User, desc: 'Yalnızca belirteceğiniz kullanıcı adı' },
  { id: 'everyone', label: 'Herkes', icon: Users, desc: 'Tüm izleyiciler tetikleyebilir' }
];

const TRIGGER_OPTIONS = [
  { id: 'member', label: 'Katılmak', icon: LogIn, desc: 'Biri yayına katıldığında' },
  { id: 'first_activity', label: 'İlk kullanıcı etkinliği', icon: Sparkles, desc: 'İzleyicinin yayındaki ilk etkileşimi' },
  { id: 'share', label: 'Paylaşmak', icon: Share2, desc: 'Yayın paylaşıldığında' },
  { id: 'follow', label: 'Takip etmek', icon: UserPlus, desc: 'Biri yayını veya sizi takip ettiğinde' },
  { id: 'subscribe', label: 'Abone', icon: UserCheck, desc: 'Yeni bir abone olduğunda' },
  { id: 'like', label: 'Beğeni gönderme (dokunma)', icon: Heart, desc: 'Ekrana dokunarak beğeni yapıldığında' },
  { id: 'chat', label: 'Sohbet', icon: MessageSquare, desc: 'Yorum yazıldığında' },
  { id: 'command', label: 'Bir komutu yorumlama', icon: Terminal, desc: 'Belirli bir komut yazıldığında (örn: !edit)' },
  { id: 'min_coins', label: 'Min. coin değerinde hediye', icon: Coins, desc: 'Belirtilen jeton veya üzerinde hediye gelince' },
  { id: 'specific_gift', label: 'Belirli bir hediye gönderme', icon: Gift, desc: '558 TikTok hediyesinden seçilen bir hediye' }
];

export default function EventModal({ eventItem, isOpen, onClose, onSave }) {
  const { actions, fetchActions, saveAutomation, showToast } = useApp();

  const [name, setName] = useState(eventItem?.ad || '');
  const [actor, setActor] = useState(eventItem?.tetikleyici?.actor || 'everyone');
  const [specificUser, setSpecificUser] = useState(eventItem?.tetikleyici?.config?.specificUser || '');

  const [triggerType, setTriggerType] = useState(eventItem?.tetikleyici?.type || 'specific_gift');
  const [likeStep, setLikeStep] = useState(eventItem?.tetikleyici?.config?.step || 1000);
  const [chatKeyword, setChatKeyword] = useState(eventItem?.tetikleyici?.config?.keyword || '');
  const [commandWord, setCommandWord] = useState(eventItem?.tetikleyici?.config?.command || '!edit');
  const [minCoins, setMinCoins] = useState(eventItem?.tetikleyici?.config?.minDiamonds || 100);

  // Specific gift selection
  const [selectedGift, setSelectedGift] = useState(() => {
    const giftName = eventItem?.tetikleyici?.config?.giftName;
    if (giftName) {
      const found = TIKTOK_GIFTS.find(g => g.name.toLowerCase() === giftName.toLowerCase());
      if (found) return found;
    }
    return TIKTOK_GIFTS[1] || TIKTOK_GIFTS[0]; // Lion or Rose
  });
  const [giftSearch, setGiftSearch] = useState('');

  // Linked action IDs
  const [selectedActionIds, setSelectedActionIds] = useState(eventItem?.actionIds || []);
  const [randomAction, setRandomAction] = useState(eventItem?.randomAction || false);
  const [cooldownSec, setCooldownSec] = useState(eventItem?.cooldownSec || 0);

  // Action creation modal
  const [createActionOpen, setCreateActionOpen] = useState(false);

  if (!isOpen) return null;

  // Filter gifts by search
  const filteredGifts = TIKTOK_GIFTS.filter(g =>
    g.name.toLowerCase().includes(giftSearch.toLowerCase()) ||
    g.turkishName.toLowerCase().includes(giftSearch.toLowerCase())
  ).slice(0, 48);

  const toggleActionSelect = (actId) => {
    setSelectedActionIds(prev =>
      prev.includes(actId) ? prev.filter(id => id !== actId) : [...prev, actId]
    );
  };

  const handleActionCreated = async (newAction) => {
    await fetchActions();
    if (newAction?.id) {
      setSelectedActionIds(prev => [...prev, newAction.id]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Auto generate name if empty
    let autoName = name.trim();
    if (!autoName) {
      const trgLabel = TRIGGER_OPTIONS.find(t => t.id === triggerType)?.label || triggerType;
      if (triggerType === 'specific_gift') {
        autoName = `${selectedGift.turkishName || selectedGift.name} Hediyesi Etkinliği`;
      } else if (triggerType === 'min_coins') {
        autoName = `${minCoins}+ Jeton Hediyesi Etkinliği`;
      } else {
        autoName = `${trgLabel} Etkinliği`;
      }
    }

    const payload = {
      id: eventItem?.id || 'event-' + Date.now(),
      ad: autoName,
      aktif: true,
      conflictMode: eventItem?.conflictMode || 'queue',
      cooldownSec: Number(cooldownSec) || 0,
      userLimitSec: 0,
      multiplier: triggerType === 'specific_gift' || triggerType === 'min_coins',
      actionIds: selectedActionIds,
      randomAction,
      tetikleyici: {
        type: triggerType,
        actor,
        config: {
          actor,
          specificUser: actor === 'specific_user' ? specificUser.trim() : '',
          giftName: triggerType === 'specific_gift' ? selectedGift.name : undefined,
          turkishName: triggerType === 'specific_gift' ? selectedGift.turkishName : undefined,
          giftId: triggerType === 'specific_gift' ? selectedGift.id : undefined,
          minDiamonds: triggerType === 'min_coins' ? Number(minCoins) : (triggerType === 'specific_gift' ? selectedGift.diamondCount : 0),
          step: triggerType === 'like' ? Number(likeStep) : undefined,
          keyword: triggerType === 'chat' ? chatKeyword.trim() : undefined,
          command: triggerType === 'command' ? commandWord.trim() : undefined,
          matchType: triggerType === 'specific_gift' ? 'specific' : (triggerType === 'min_coins' ? 'diamonds' : 'all')
        }
      },
      aksiyonlar: []
    };

    const saved = await saveAutomation(payload);
    if (saved) {
      showToast('success', 'Etkinlik Kaydedildi! 🎉', `"${payload.ad}" başarıyla kaydedildi ve aktif hale getirildi.`);
      if (onSave) onSave(payload);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#121626] border border-white/10 rounded-2xl max-w-3xl w-full my-8 shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0E1220]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Yeni Etkinlik</h2>
              <p className="text-xs text-slate-400">Canlı yayın etkileşimi ve video/eylem tetikleyicisi tanımlayın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* 1. Kimin Tetikleyebileceğini Seçin */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>Bu eylemleri kimin tetikleyebileceğini seçin</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {ACTOR_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = actor === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setActor(item.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-[#181E34] border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-snug">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Belirli Kullanıcı Girişi */}
            {actor === 'specific_user' && (
              <div className="p-3 rounded-xl bg-[#181E34] border border-cyan-500/40 space-y-1 mt-2">
                <label className="text-xs font-medium text-slate-300">TikTok Kullanıcı Adı (@ olmadan)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-bold">@</span>
                  <input
                    type="text"
                    value={specificUser}
                    onChange={(e) => setSpecificUser(e.target.value)}
                    placeholder="kullaniciadi"
                    className="w-full bg-[#0E1220] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Tetikleyici Olay Türünü Seçin */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Tetikleyici olay türünü seçin</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRIGGER_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = triggerType === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setTriggerType(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-pink-500/15 border-pink-500 text-white shadow-lg shadow-pink-500/10'
                        : 'bg-[#181E34] border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-pink-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-snug">{item.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Sub-inputs based on trigger type */}
            {triggerType === 'like' && (
              <div className="p-4 rounded-xl bg-[#181E34] border border-pink-500/30 space-y-2">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Kaç Beğenide Bir Tetiklensin?</span>
                  <span className="text-pink-400 font-bold font-mono">{likeStep} Beğeni</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={likeStep}
                  onChange={(e) => setLikeStep(Number(e.target.value))}
                  className="w-full bg-[#0E1220] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            )}

            {triggerType === 'chat' && (
              <div className="p-4 rounded-xl bg-[#181E34] border border-pink-500/30 space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  İçeren Kelime veya Cümle (Boş bırakırsanız tüm sohbetler tetikler):
                </label>
                <input
                  type="text"
                  value={chatKeyword}
                  onChange={(e) => setChatKeyword(e.target.value)}
                  placeholder="örn: kral, tebrikler, efsane"
                  className="w-full bg-[#0E1220] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            )}

            {triggerType === 'command' && (
              <div className="p-4 rounded-xl bg-[#181E34] border border-pink-500/30 space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  Komut Adı (İzleyiciler sohbete yazdığında çalışır):
                </label>
                <input
                  type="text"
                  value={commandWord}
                  onChange={(e) => setCommandWord(e.target.value)}
                  placeholder="!edit veya !dans"
                  className="w-full bg-[#0E1220] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            )}

            {triggerType === 'min_coins' && (
              <div className="p-4 rounded-xl bg-[#181E34] border border-pink-500/30 space-y-2">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Minimum Jeton Değeri (Coin)</span>
                  <span className="text-amber-400 font-bold font-mono">≥ {minCoins} Jeton</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={minCoins}
                  onChange={(e) => setMinCoins(Number(e.target.value))}
                  className="w-full bg-[#0E1220] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            )}

            {triggerType === 'specific_gift' && (
              <div className="p-4 rounded-xl bg-[#181E34] border border-pink-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-pink-400" />
                    <span>Seçilen TikTok Hediyesi</span>
                  </span>
                  {selectedGift && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/20 border border-pink-500/40 rounded-xl text-xs font-bold text-pink-300">
                      <img src={selectedGift.icon} alt="" className="w-5 h-5 object-contain" />
                      <span>{selectedGift.turkishName || selectedGift.name}</span>
                      <span className="text-amber-400">💎 {selectedGift.diamondCount}</span>
                    </div>
                  )}
                </div>

                {/* Gift Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={giftSearch}
                    onChange={(e) => setGiftSearch(e.target.value)}
                    placeholder="558 hediye arasında ara (Aslan, Gül, Asa, Ejderha, vb.)..."
                    className="w-full bg-[#0E1220] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Gift Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-[#0E1220] rounded-xl border border-white/5">
                  {filteredGifts.map((gift) => {
                    const isPicked = selectedGift?.id === gift.id || selectedGift?.name === gift.name;
                    return (
                      <button
                        type="button"
                        key={gift.id || gift.name}
                        onClick={() => setSelectedGift(gift)}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition text-center ${
                          isPicked
                            ? 'bg-pink-500/20 border-2 border-pink-500 shadow-md'
                            : 'bg-white/5 hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        <img src={gift.icon} alt={gift.name} className="w-8 h-8 object-contain" />
                        <span className="text-[10px] font-bold text-white line-clamp-1">
                          {gift.turkishName || gift.name}
                        </span>
                        <span className="text-[9px] text-amber-400 font-mono">
                          💎 {gift.diamondCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Eylemler ("Tüm bu eylemleri tetikleyin") */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Film className="w-4 h-4" />
                <span>Eylemler (Tetiklenecek Video, Ses ve Efektler)</span>
              </label>

              <button
                type="button"
                onClick={() => setCreateActionOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Yeni Eylem Oluştur</span>
              </button>
            </div>

            {/* List of Created Actions */}
            {actions.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#181E34] border border-dashed border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-400">Henüz kaydedilmiş eylem (video, ses veya uyarı) bulunamadı.</p>
                <button
                  type="button"
                  onClick={() => setCreateActionOpen(true)}
                  className="px-4 py-2 rounded-xl gradient-brand text-white text-xs font-bold hover:opacity-90 transition"
                >
                  Şimdi Bir Eylem Oluşturun
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {actions.map((act) => {
                  const isChecked = selectedActionIds.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      onClick={() => toggleActionSelect(act.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-[#181E34] border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-500 text-black'
                              : 'border-slate-500 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{act.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {act.types?.video && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                                🎬 Video ({act.duration || 6}s)
                              </span>
                            )}
                            {act.types?.sound && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                🎵 Ses
                              </span>
                            )}
                            {act.types?.alert && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">
                                🔔 Uyarı
                              </span>
                            )}
                            {act.types?.tts && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                                🗣️ TTS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 font-mono">
                        {act.duration ? `${act.duration}s` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Random Trigger Option */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#181E34] border border-white/5">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Bu eylemlerden birini tetikle (rastgele)</span>
              </div>
              <input
                type="checkbox"
                checked={randomAction}
                onChange={(e) => setRandomAction(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-[#0E1220] border-white/20"
              />
            </div>
          </div>

          {/* 4. Etkinlik Adı ve Bekleme Süresi (Cooldown) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Etkinlik Adı (İsteğe bağlı)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Aslan Krallık Şovu"
                className="w-full bg-[#0E1220] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Bekleme Süresi (Cooldown)</span>
                <span className="text-slate-500 font-mono">{cooldownSec} saniye</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={cooldownSec}
                onChange={(e) => setCooldownSec(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[#0E1220] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl gradient-brand hover:opacity-90 text-white text-xs font-black shadow-lg shadow-purple-500/20 transition active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Etkinliği Kaydet</span>
            </button>
          </div>
        </form>
      </div>

      {/* Submodal to Create Action right here */}
      {createActionOpen && (
        <ActionModal
          isOpen={true}
          onClose={() => setCreateActionOpen(false)}
          onSave={handleActionCreated}
        />
      )}
    </div>
  );
}
