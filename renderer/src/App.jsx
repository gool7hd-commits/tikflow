import React from 'react';
import { useApp } from './store/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import SimulatorModal from './components/SimulatorModal';
import ToastContainer from './components/ToastContainer';

import DashboardPage from './pages/DashboardPage';
import GiftsPage from './pages/GiftsPage';
import EditsPage from './pages/EditsPage';
import AutomationsPage from './pages/AutomationsPage';
import ScreenEditorPage from './pages/ScreenEditorPage';
import SoundsPage from './pages/SoundsPage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { activePage } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0E1A] text-slate-100 font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <TopBar />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto">
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'gifts' && <GiftsPage />}
          {activePage === 'edits' && <EditsPage />}
          {activePage === 'automations' && <AutomationsPage />}
          {activePage === 'screen' && <ScreenEditorPage />}
          {activePage === 'sounds' && <SoundsPage />}
          {activePage === 'media' && <MediaLibraryPage />}
          {activePage === 'history' && <HistoryPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Modals & Overlays */}
      <SimulatorModal />
      <ToastContainer />
    </div>
  );
}
