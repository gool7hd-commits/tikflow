import React from 'react';
import { useApp } from '../store/AppContext';
import {
  LayoutDashboard,
  Gift,
  Film,
  Zap,
  MonitorPlay,
  Volume2,
  FolderOpen,
  History,
  Settings,
  Tv,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function Sidebar() {
  const { activePage, setActivePage, automations, transparentStatus, openTransparentOverlay, closeTransparentOverlay } = useApp();

  const activeAutomationsCount = automations.filter((a) => a.aktif).length;

  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: LayoutDashboard },
    { id: 'gifts', label: 'Hediyeler', icon: Gift },
    { id: 'edits', label: 'Editler', icon: Film },
    { id: 'automations', label: 'Otomasyonlar', icon: Zap, badge: activeAutomationsCount },
    { id: 'screen', label: 'Yayın Ekranı', icon: MonitorPlay },
    { id: 'sounds', label: 'Sesler', icon: Volume2 },
    { id: 'media', label: 'Medya Kütüphanesi', icon: FolderOpen },
    { id: 'history', label: 'Geçmiş', icon: History },
    { id: 'settings', label: 'Ayarlar', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#0E1326] border-r border-white/5 flex flex-col h-screen select-none z-30">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
            TikFlow
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            TikTok LIVE Otomasyon
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Transparent Desktop Overlay Quick Control */}
      <div className="px-4 py-3 mx-3 mb-3 bg-[#13182C] border border-white/5 rounded-2xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">Masaüstü Overlay</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              transparentStatus.isOpen ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'
            }`}
          />
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Oyunun veya ekranın üstünde şeffaf pencere açar.
        </p>
        <button
          onClick={() => {
            if (transparentStatus.isOpen) closeTransparentOverlay();
            else openTransparentOverlay();
          }}
          className={`w-full text-xs font-bold py-1.5 px-3 rounded-lg transition-all ${
            transparentStatus.isOpen
              ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
          }`}
        >
          {transparentStatus.isOpen ? 'Pencereyi Kapat' : 'Şeffaf Pencereyi Başlat'}
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-400">TikFlow v1.0.0</span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          PRO
        </span>
      </div>
    </aside>
  );
}
