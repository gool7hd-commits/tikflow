import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import {
  Radio,
  Copy,
  SlidersHorizontal,
  Flame,
  Plus,
  Trash2,
  CopyPlus,
  Users,
  Check,
  Globe,
  AlertTriangle,
  RefreshCw,
  Video
} from 'lucide-react';

export default function TopBar() {
  const {
    status,
    profiles,
    activeProfileId,
    selectProfile,
    createProfile,
    duplicateProfile,
    deleteProfile,
    tiktokModalOpen,
    setTiktokModalOpen,
    simulatorOpen,
    setSimulatorOpen,
    copyOverlayUrl,
    connectTikTok,
    disconnectTikTok
  } = useApp();

  const [newProfileName, setNewProfileName] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [tiktokUsernameInput, setTiktokUsernameInput] = useState(status.tiktok?.username || '');
  const [isConnecting, setIsConnecting] = useState(false);

  const ttStatus = status.tiktok?.status || 'disconnected';
  const isConnected = ttStatus === 'connected';
  const isConnectingState = ttStatus === 'connecting' || isConnecting;
  const viewerCount = status.tiktok?.viewerCount || 0;
  const ttError = status.tiktok?.error || null;
  const roomInfo = status.tiktok?.roomInfo || null;

  const obsClients = status.overlayClientCount || 0;
  const isObsConnected = obsClients > 0;

  const handleConnectTikTok = async (e) => {
    e.preventDefault();
    if (!tiktokUsernameInput.trim()) return;
    setIsConnecting(true);
    await connectTikTok(tiktokUsernameInput.trim());
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    await disconnectTikTok();
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    await createProfile(newProfileName.trim());
    setNewProfileName('');
    setShowProfileMenu(false);
  };

  return (
    <>
      <header className="h-16 bg-[#0E1326]/90 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between select-none z-20">
        {/* Left: Profile Switcher */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Profil:</span>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181E36] hover:bg-[#202747] border border-white/10 text-sm font-semibold text-slate-200 transition"
              >
                <span>{profiles.find((p) => p.id === activeProfileId)?.name || 'Normal Yayın'}</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#141A33] border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Profiller
                  </div>
                  <div className="space-y-0.5 my-1 max-h-48 overflow-y-auto">
                    {profiles.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          p.id === activeProfileId
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                        onClick={() => {
                          selectProfile(p.id);
                          setShowProfileMenu(false);
                        }}
                      >
                        <span className="truncate">{p.name}</span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Kopyala"
                            onClick={() => duplicateProfile(p.id)}
                            className="p-1 hover:text-purple-300 text-slate-400 transition"
                          >
                            <CopyPlus className="w-3 h-3" />
                          </button>
                          {p.id !== 'default' && (
                            <button
                              title="Sil"
                              onClick={() => deleteProfile(p.id)}
                              className="p-1 hover:text-red-400 text-slate-400 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleCreateProfile} className="pt-2 border-t border-white/5 flex gap-1">
                    <input
                      type="text"
                      placeholder="Yeni profil..."
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="flex-1 bg-[#0B0E1A] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-3">
          {/* OBS / Studio Client Status */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isObsConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/40 border-white/5 text-slate-400'
            }`}
            title={isObsConnected ? `${obsClients} aktif overlay bağlantısı mevcut` : 'Henüz OBS veya tarayıcı kaynağı bağlı değil'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isObsConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{isObsConnected ? `OBS Bağlı (${obsClients})` : 'OBS Bekleniyor'}</span>
          </div>

          {/* TikTok Connection Button */}
          {(() => {
            const isOfflineWaiting = ttStatus === 'offline' && status.tiktok?.username;
            return (
              <button
                onClick={() => setTiktokModalOpen(true)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                  isConnected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                    : isOfflineWaiting
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    : isConnectingState
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30'
                    : 'bg-purple-600/15 border-purple-500/30 text-purple-300 hover:bg-purple-600/25'
                }`}
              >
                <Radio
                  className={`w-3.5 h-3.5 ${
                    isConnected
                      ? 'text-emerald-400 animate-pulse'
                      : isOfflineWaiting
                      ? 'text-amber-400 animate-pulse'
                      : isConnectingState
                      ? 'text-purple-400 animate-spin'
                      : 'text-purple-400'
                  }`}
                />
                <span>
                  {isConnected
                    ? `@${status.tiktok?.username} (${viewerCount.toLocaleString('tr-TR')} İzleyici)`
                    : isOfflineWaiting
                    ? `@${status.tiktok?.username} (Yayın Bekleniyor 🟡)`
                    : isConnectingState
                    ? 'Bağlanılıyor...'
                    : 'TikTok Canlı Yayın Bağla'}
                </span>
              </button>
            );
          })()}

          {/* Overlay Link Copy Button */}
          <button
            onClick={copyOverlayUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181E36] hover:bg-[#202747] border border-white/10 text-xs font-semibold text-slate-200 transition"
            title="OBS veya TikTok LIVE Studio için tek link overlay URL'sini kopyalar"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Overlay Linki</span>
            <Copy className="w-3 h-3 text-slate-400 ml-1" />
          </button>

          {/* Quick Simulator / Test Trigger Button */}
          <button
            onClick={() => setSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl gradient-pink hover:opacity-90 text-xs font-extrabold text-white shadow-md shadow-pink-500/20 transition active:scale-95"
          >
            <Flame className="w-4 h-4 text-white animate-bounce" />
            <span>Hızlı Test Paneli</span>
          </button>
        </div>
      </header>

      {/* TikTok Connection Modal */}
      {tiktokModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12172D] border border-purple-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              <span>TikTok Canlı Yayınına Bağlan</span>
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Yayıncının TikTok kullanıcı adını yazarak yayına doğrudan bağlanın.
              <span className="text-emerald-400 font-bold block mt-1">
                ✓ Şifre veya giriş bilgisi kesinlikle gerekmez.
              </span>
              <span className="text-cyan-400 block mt-0.5">
                ✓ Yayın başladığında tüm hediye, beğeni ve sohbet olayları otomatik yakalanır.
              </span>
            </p>

            <form onSubmit={handleConnectTikTok} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  TikTok Kullanıcı Adı
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="kullanici_adi"
                    value={tiktokUsernameInput}
                    onChange={(e) => setTiktokUsernameInput(e.target.value)}
                    className="w-full bg-[#0B0E1A] border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition font-mono"
                  />
                </div>
              </div>

              {/* Status display: Connected */}
              {isConnected && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1 text-xs text-emerald-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Bağlandı: @{status.tiktok?.username}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-white">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{viewerCount.toLocaleString('tr-TR')} İzleyici</span>
                    </div>
                  </div>
                  {roomInfo && (
                    <div className="text-[11px] text-slate-300 truncate">
                      Oda: <span className="font-semibold">{roomInfo.title || 'Canlı Yayın'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status display: Standby / Offline */}
              {ttStatus === 'offline' && !isConnected && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs text-amber-300 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>Yayın Bekleniyor: @{status.tiktok?.username || tiktokUsernameInput}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono">
                      Otomatik Dinlemede
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Yayıncı şu anda canlı yayında değil. TikFlow arka planda periyodik olarak kontrol ediyor; yayın açıldığı anda hiçbir ek işlem yapmanıza gerek kalmadan otomatik bağlanılacaktır.
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-amber-500/20">
                    <span className="text-[10px] text-slate-400">Yayın açılana kadar test yapabilirsiniz:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTiktokModalOpen(false);
                        setSimulatorOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 font-bold text-[10px] transition flex items-center gap-1"
                    >
                      <Flame className="w-3 h-3 text-pink-400" />
                      <span>Simülatörü Aç</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status display: Real Error notification */}
              {ttStatus === 'error' && ttError && !isConnected && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <div className="leading-snug">
                    <div className="font-bold">Bağlantı Uyarısı</div>
                    <div>{ttError}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setTiktokModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  Kapat
                </button>
                {isConnected ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition shadow-md"
                  >
                    Bağlantıyı Kes
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isConnectingState}
                    className="px-5 py-2 rounded-xl gradient-brand hover:opacity-90 text-xs font-bold text-white transition disabled:opacity-50 shadow-md shadow-purple-500/20 flex items-center gap-1.5"
                  >
                    {isConnectingState ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Bağlanılıyor...</span>
                      </>
                    ) : (
                      <span>Canlı Yayına Bağlan</span>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
