import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [status, setStatus] = useState({
    port: 21420,
    tiktok: { status: 'disconnected', username: '', viewerCount: 0 },
    obsConnected: false,
    overlayClientCount: 0,
    counters: { totalLikes: 0, totalDiamonds: 0, followerCount: 0, topGifters: [] },
    settings: { port: 21420, layout: 'vertical', defaultVolume: 80 }
  });

  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState('default');
  const [automations, setAutomations] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [actions, setActions] = useState([]);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [tiktokModalOpen, setTiktokModalOpen] = useState(false);
  const [transparentStatus, setTransparentStatus] = useState({ isOpen: false, isClickThrough: false });

  // Toast Helper
  const showToast = useCallback((type, title, message) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.activeProfileId && data.activeProfileId !== activeProfileId) {
          setActiveProfileId(data.activeProfileId);
        }
      }
    } catch (e) {
      // Backend not yet ready or polling error
    }
  }, [activeProfileId]);

  // Fetch Profiles
  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
        setActiveProfileId(data.activeProfileId || 'default');
      }
    } catch (e) {}
  }, []);

  // Fetch Automations
  const fetchAutomations = useCallback(async () => {
    try {
      const res = await fetch(`/api/automations?profileId=${activeProfileId}`);
      if (res.ok) {
        const data = await res.json();
        setAutomations(data);
      }
    } catch (e) {}
  }, [activeProfileId]);

  // Fetch Media
  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (e) {}
  }, []);

  // Fetch Actions
  const fetchActions = useCallback(async () => {
    try {
      const res = await fetch('/api/actions');
      if (res.ok) {
        const data = await res.json();
        setActions(data);
      }
    } catch (e) {}
  }, []);

  // Poll status regularly
  useEffect(() => {
    fetchStatus();
    fetchProfiles();
    fetchAutomations();
    fetchMedia();
    fetchActions();

    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchProfiles, fetchAutomations, fetchMedia, fetchActions]);

  // Reload automations when active profile changes
  useEffect(() => {
    fetchAutomations();
  }, [activeProfileId, fetchAutomations]);

  // Profiles operations
  const selectProfile = async (id) => {
    try {
      const res = await fetch(`/api/profiles/${id}/select`, { method: 'POST' });
      if (res.ok) {
        setActiveProfileId(id);
        fetchAutomations();
        showToast('success', 'Profil Değiştirildi', `Aktif profil güncellendi.`);
      }
    } catch (e) {
      showToast('error', 'Hata', 'Profil seçilemedi');
    }
  };

  const createProfile = async (name) => {
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const prof = await res.json();
        await fetchProfiles();
        await selectProfile(prof.id);
        showToast('success', 'Profil Oluşturuldu', `"${name}" profili başarıyla oluşturuldu.`);
        return prof;
      }
    } catch (e) {
      showToast('error', 'Hata', 'Profil oluşturulamadı');
    }
  };

  const duplicateProfile = async (id, newName) => {
    try {
      const res = await fetch(`/api/profiles/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        await fetchProfiles();
        showToast('success', 'Profil Kopyalandı', 'Profil ve ayarları kopyalandı.');
      }
    } catch (e) {
      showToast('error', 'Hata', 'Profil kopyalanamadı');
    }
  };

  const deleteProfile = async (id) => {
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchProfiles();
        showToast('success', 'Profil Silindi', 'Profil başarıyla kaldırıldı.');
      } else {
        const err = await res.json();
        showToast('error', 'Silinemedi', err.error || 'İşlem başarısız');
      }
    } catch (e) {
      showToast('error', 'Hata', 'Profil silinemedi');
    }
  };

  // Automations operations
  const saveAutomation = async (automation) => {
    try {
      const isEdit = !!automation.id;
      const url = isEdit ? `/api/automations/${automation.id}` : '/api/automations';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...automation, profileId: activeProfileId })
      });

      if (res.ok) {
        fetchAutomations();
        showToast('success', isEdit ? 'Güncellendi' : 'Oluşturuldu', `"${automation.ad}" otomasyonu kaydedildi.`);
        return true;
      }
    } catch (e) {
      showToast('error', 'Hata', 'Otomasyon kaydedilemedi');
    }
    return false;
  };

  const deleteAutomation = async (id) => {
    try {
      const res = await fetch(`/api/automations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAutomations();
        showToast('success', 'Silindi', 'Otomasyon başarıyla silindi.');
      }
    } catch (e) {
      showToast('error', 'Hata', 'Otomasyon silinemedi');
    }
  };

  const duplicateAutomation = async (id) => {
    try {
      const res = await fetch(`/api/automations/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        fetchAutomations();
        showToast('success', 'Kopyalandı', 'Otomasyon kuralı kopyalandı.');
      }
    } catch (e) {
      showToast('error', 'Hata', 'Otomasyon kopyalanamadı');
    }
  };

  const toggleAutomation = async (id) => {
    try {
      const res = await fetch(`/api/automations/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        fetchAutomations();
      }
    } catch (e) {
      showToast('error', 'Hata', 'Durum değiştirilemedi');
    }
  };

  const toggleAllAutomations = async (enable) => {
    try {
      const res = await fetch('/api/automations/toggle-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable })
      });
      if (res.ok) {
        fetchAutomations();
        showToast('success', 'Toplu Güncelleme', enable ? 'Tüm otomasyonlar açıldı.' : 'Tüm otomasyonlar kapatıldı.');
      }
    } catch (e) {
      showToast('error', 'Hata', 'İşlem başarısız');
    }
  };

  const testAutomation = async (id) => {
    try {
      const res = await fetch(`/api/automations/${id}/test`, { method: 'POST' });
      if (res.ok) {
        showToast('info', 'Test Ediliyor', 'Otomasyon tetiklendi ve overlaye iletildi.');
      }
    } catch (e) {
      showToast('error', 'Hata', 'Test başlatılamadı');
    }
  };

  // TikTok Controls
  const connectTikTok = async (username) => {
    try {
      const res = await fetch('/api/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchStatus();
        if (data.connected) {
          showToast('success', 'Bağlantı Başarılı', `@${data.username || username} canlı yayınına bağlanıldı! 🟢`);
        } else if (data.isOffline) {
          showToast('info', 'Yayın Bekleniyor 🟡', `@${data.username || username} şu anda canlı yayında değil. Yayın açıldığında otomatik bağlanılacak.`);
        } else {
          showToast('info', 'TikTok Bağlantısı', data.message || `@${username} dinleniyor...`);
        }
        return true;
      } else {
        showToast('error', 'Bağlantı Hatası', data.error || 'Yayına bağlanılamadı.');
        return false;
      }
    } catch (e) {
      showToast('error', 'Bağlantı Hatası', e.message);
      return false;
    }
  };

  const disconnectTikTok = async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' });
      fetchStatus();
      showToast('info', 'Bağlantı Kesildi', 'TikTok bağlantısı sonlandırıldı.');
    } catch (e) {}
  };

  // Simulator
  const triggerSimulator = async (eventData) => {
    try {
      const res = await fetch('/api/simulator/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (res.ok) {
        fetchStatus();
        showToast('info', 'Simülasyon Gönderildi', `${eventData.type.toUpperCase()} olayı aktif overlay'e iletildi.`);
      }
    } catch (e) {
      showToast('error', 'Hata', 'Simülasyon tetiklenemedi');
    }
  };

  const testOverlay = async () => {
    try {
      const res = await fetch('/api/overlay/test', { method: 'POST' });
      if (res.ok) {
        showToast('success', 'Overlay Testi', 'Gerçek test uyarısı overlay ekranına gönderildi.');
      }
    } catch (e) {}
  };

  // Media Management
  const uploadMedia = async (file, name, duration = 5) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (name) formData.append('name', name);
      formData.append('duration', duration);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const item = await res.json();
        fetchMedia();
        showToast('success', 'Medya Eklendi', `"${item.name}" başarıyla kütüphaneye eklendi.`);
        return item;
      }
    } catch (e) {
      showToast('error', 'Hata', 'Medya yüklenemedi');
    }
    return null;
  };

  const deleteMedia = async (id) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        fetchMedia();
        if (data.inUse) {
          showToast('warning', 'Dikkat', 'Bu medya bazı otomasyonlarda kullanılıyordu.');
        } else {
          showToast('success', 'Silindi', 'Medya dosyası silindi.');
        }
      }
    } catch (e) {
      showToast('error', 'Hata', 'Medya silinemedi');
    }
  };

  const testMedia = async (mediaItem, duration = 6, volume = 100) => {
    try {
      const res = await fetch('/api/overlay/test-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl: mediaItem.relativeUrl,
          duration: Number(duration) || mediaItem.duration || 6,
          volume: Number(volume)
        })
      });
      if (res.ok) {
        showToast('info', 'Edit Test Ediliyor', `"${mediaItem.name}" overlay ekranına iletildi.`);
      }
    } catch (e) {
      showToast('error', 'Hata', 'Video test edilemedi');
    }
  };

  const bindMediaGift = async (mediaId, payload) => {
    try {
      const res = await fetch(`/api/media/${mediaId}/bind-gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchAutomations();
        const giftLabel = payload.turkishName || payload.giftName || (payload.giftName === 'ALL' ? 'Tüm Hediyeler' : 'Hediye');
        showToast('success', 'Hediye Bağlandı! 🎁', `Bu edit artık "${giftLabel}" geldiğinde otomatik oynatılacak.`);
        return data;
      }
    } catch (e) {
      showToast('error', 'Hata', 'Hediye eşleştirilemedi');
    }
    return null;
  };

  // Transparent Desktop Overlay (Electron IPC)
  const openTransparentOverlay = async () => {
    if (window.electronAPI?.openTransparentOverlay) {
      await window.electronAPI.openTransparentOverlay();
      setTransparentStatus(prev => ({ ...prev, isOpen: true }));
      showToast('success', 'Masaüstü Penceresi Açıldı', 'Şeffaf overlay pencereniz ekranın üzerinde görüntülendi.');
    } else {
      showToast('info', 'Tarayıcı Modu', 'Electron dışındasınız. Lütfen overlay linkini OBS veya tarayıcıda açın.');
    }
  };

  const closeTransparentOverlay = async () => {
    if (window.electronAPI?.closeTransparentOverlay) {
      await window.electronAPI.closeTransparentOverlay();
      setTransparentStatus(prev => ({ ...prev, isOpen: false }));
    }
  };

  const toggleClickThrough = async () => {
    if (window.electronAPI?.toggleClickThrough) {
      const nextState = !transparentStatus.isClickThrough;
      await window.electronAPI.toggleClickThrough(nextState);
      setTransparentStatus(prev => ({ ...prev, isClickThrough: nextState }));
      showToast('info', 'Tıklama Geçirme', nextState ? 'Tıklamalar arkaya geçiriliyor (Kilitli)' : 'Tıklamalar aktif');
    }
  };

  // Copy Overlay URL
  const copyOverlayUrl = () => {
    const url = `http://localhost:${status.port || 21420}/overlay`;
    navigator.clipboard.writeText(url);
    showToast('success', 'Panoya Kopyalandı!', `Overlay Linki kopyalandı:\n${url}`);
  };

  const value = {
    activePage,
    setActivePage,
    status,
    profiles,
    activeProfileId,
    automations,
    actions,
    fetchActions,
    mediaList,
    toasts,
    showToast,
    removeToast,
    simulatorOpen,
    setSimulatorOpen,
    tiktokModalOpen,
    setTiktokModalOpen,
    transparentStatus,
    selectProfile,
    createProfile,
    duplicateProfile,
    deleteProfile,
    fetchAutomations,
    saveAutomation,
    deleteAutomation,
    duplicateAutomation,
    toggleAutomation,
    toggleAllAutomations,
    testAutomation,
    connectTikTok,
    disconnectTikTok,
    triggerSimulator,
    testOverlay,
    fetchMedia,
    uploadMedia,
    deleteMedia,
    testMedia,
    bindMediaGift,
    openTransparentOverlay,
    closeTransparentOverlay,
    toggleClickThrough,
    copyOverlayUrl,
    fetchStatus
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
