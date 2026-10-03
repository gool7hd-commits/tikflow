// TikFlow Pure JS Overlay Client (LiveInteract Enhanced)
(function () {
  // ── LiveInteract LiveStudio / OBS Performance Flags (?livestudio=1 or ?perf=1) ──
  const urlParams = new URLSearchParams(window.location.search);
  const layoutParam = urlParams.get('layout');
  const isPerfMode = urlParams.get('livestudio') === '1' || urlParams.get('perf') === '1';

  if (isPerfMode) {
    document.documentElement.classList.add('bx-perf');
    document.documentElement.classList.add('li-noblur');
  }

  const canvas = document.getElementById('overlay-canvas');
  const alertBanner = document.getElementById('alert-banner');
  const alertAvatar = document.getElementById('alert-avatar');
  const alertGiftIcon = document.getElementById('alert-gift-icon');
  const alertTitle = document.getElementById('alert-title');
  const alertSubtitle = document.getElementById('alert-subtitle');
  const alertComboBadge = document.getElementById('alert-combo-badge');

  const mediaVideo = document.getElementById('media-video');
  const mediaImage = document.getElementById('media-image');

  const chatContainer = document.getElementById('chat-messages');
  const counterLikes = document.getElementById('counter-likes');
  const counterDiamonds = document.getElementById('counter-diamonds');
  const goalTitle = document.getElementById('goal-title');
  const goalFraction = document.getElementById('goal-fraction');
  const goalFill = document.getElementById('goal-bar-fill');
  const leaderboardList = document.getElementById('leaderboard-list');
  const tickerFollower = document.getElementById('ticker-follower');
  const tickerGift = document.getElementById('ticker-gift');
  const viewerCountEl = document.getElementById('viewer-count');
  const customTextEl = document.getElementById('custom-text-content');
  const ttsIndicator = document.getElementById('tts-indicator');
  const ttsText = document.getElementById('tts-text');

  let currentSettings = { layout: 'vertical' };
  let currentLayout = [];
  let currentCounters = { totalLikes: 0, totalDiamonds: 0, followerCount: 0 };
  let alertTimer = null;
  let mediaTimer = null;

  // Handle Dynamic Scale
  function updateScale() {
    const isHorizontal = layoutParam === 'horizontal' || (!layoutParam && currentSettings.layout === 'horizontal');
    const baseWidth = isHorizontal ? 1920 : 1080;
    const baseHeight = isHorizontal ? 1080 : 1920;

    if (isHorizontal) {
      canvas.classList.remove('layout-vertical');
      canvas.classList.add('layout-horizontal');
    } else {
      canvas.classList.remove('layout-horizontal');
      canvas.classList.add('layout-vertical');
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const scale = Math.min(winW / baseWidth, winH / baseHeight);

    canvas.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', updateScale);
  updateScale();

  // Apply Custom Streamer CSS (Keyframes / Custom Rules)
  function applyCustomCss(css) {
    let el = document.getElementById('tikflow-custom-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'tikflow-custom-css';
      document.head.appendChild(el);
    }
    el.textContent = css || '';
  }

  // Apply Layout from Server (positions, visibility, z-index, opacity)
  function applyLayout(widgets) {
    if (!Array.isArray(widgets)) return;
    currentLayout = widgets;

    const curPath = window.location.pathname;
    const isTopLikerOnly = curPath.includes('/topliker') || urlParams.get('widget') === 'topliker';
    const isMekanSahibiOnly = curPath.includes('/mekansahibi') || urlParams.get('widget') === 'mekansahibi';
    const isComboMekanOnly = curPath.includes('/combomekansahibi') || urlParams.get('widget') === 'combomekansahibi';
    const isFireworkOnly = curPath.includes('/firework') || urlParams.get('widget') === 'firework';
    const isIsolated = isTopLikerOnly || isMekanSahibiOnly || isComboMekanOnly || isFireworkOnly;

    if (isIsolated) {
      document.querySelectorAll('.overlay-widget').forEach(el => el.style.display = 'none');
      if (isTopLikerOnly) {
        const el = document.getElementById('widget-topliker');
        if (el) { el.style.display = 'flex'; el.style.left = '50px'; el.style.top = '50px'; }
      }
      if (isMekanSahibiOnly) {
        const el = document.getElementById('widget-mekansahibi');
        if (el) { el.style.display = 'flex'; el.style.left = '50px'; el.style.top = '50px'; }
      }
      if (isComboMekanOnly) {
        const el = document.getElementById('widget-combomekansahibi');
        if (el) { el.style.display = 'flex'; el.style.left = '50px'; el.style.top = '120px'; }
      }
      return;
    }

    // Hide all overlay widgets by default if not listed or if disabled
    const activeMap = new Map();
    widgets.forEach((w) => {
      activeMap.set(w.id, w);
    });

    document.querySelectorAll('.overlay-widget').forEach((el) => {
      const w = activeMap.get(el.id);
      if (!w || w.enabled === false) {
        el.style.display = 'none';
      }
    });

    widgets.forEach((w) => {
      const el = document.getElementById(w.id);
      if (!el) return;

      if (w.enabled === false) {
        el.style.display = 'none';
        return;
      }

      el.style.display = 'flex';
      el.style.left = `${w.x || 0}px`;
      el.style.top = `${w.y || 0}px`;
      el.style.width = `${w.width || 300}px`;
      el.style.height = `${w.height || 100}px`;
      el.style.zIndex = w.zIndex || 10;
      el.style.opacity = (w.opacity !== undefined ? w.opacity : 100) / 100;
      el.style.transform = `rotate(${w.rotation || 0}deg)`;

      // Custom properties
      if (w.type === 'customText' && customTextEl) {
        customTextEl.textContent = w.customText || '⚡ TikFlow LIVE';
      }
      if (w.type === 'goalBar') {
        if (goalTitle && w.goalTitle) goalTitle.textContent = w.goalTitle;
        if (goalFill && goalFraction) {
          const target = Number(w.goalTarget) || 1000;
          let current = 0;
          if (w.goalType === 'like') current = currentCounters?.totalLikes || 0;
          else if (w.goalType === 'follower') current = currentCounters?.followerCount || 0;
          else current = currentCounters?.totalDiamonds || 0;

          const pct = Math.min(100, Math.round((current / target) * 100));
          goalFill.style.width = `${pct}%`;
          goalFraction.textContent = `${current.toLocaleString('tr-TR')} / ${target.toLocaleString('tr-TR')} (%${pct})`;
        }
      }
    });
  }

  // Audio Playback
  function playSound(url, volume = 80) {
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(1, volume / 100));
      audio.play().catch((err) => {
        console.warn('[Overlay Audio] Playback prevented:', err.message);
      });
    } catch (e) {
      console.warn('[Overlay Audio] Error:', e.message);
    }
  }

  // TTS Web Speech API
  function speakTTS(text, voice = 'tr-TR', rate = 1.0) {
    if (!text || !('speechSynthesis' in window)) return;

    if (ttsIndicator && ttsText) {
      ttsText.textContent = text;
      ttsIndicator.style.display = 'flex';
      setTimeout(() => {
        ttsIndicator.style.display = 'none';
      }, 4000);
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice;
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[TTS] Synthesis error:', e.message);
    }
  }

  // Alert Box Trigger (with Combo Multiplier Badge)
  function showAlert(data) {
    if (alertTimer) clearTimeout(alertTimer);

    alertTitle.textContent = data.text || 'Tebrikler!';
    alertSubtitle.textContent = data.subText || '';

    if (data.userAvatar) {
      alertAvatar.src = data.userAvatar;
      alertAvatar.style.display = 'block';
    } else {
      alertAvatar.style.display = 'none';
    }

    if (data.giftIcon) {
      alertGiftIcon.src = data.giftIcon;
      alertGiftIcon.style.display = 'block';
    } else {
      alertGiftIcon.style.display = 'none';
    }

    // LiveInteract Style Combo Multiplier Badge
    if (alertComboBadge) {
      const comboCount = Number(data.repeatCount || data.count || 1);
      if (comboCount > 1) {
        alertComboBadge.textContent = `x${comboCount} KOMBO! 🔥`;
        alertComboBadge.style.display = 'block';
      } else {
        alertComboBadge.style.display = 'none';
      }
    }

    // Animation class
    const animClass = `anim-${data.animation || 'zoom'}`;
    alertBanner.className = `alert-box-inner ${animClass}`;
    alertBanner.style.display = 'flex';

    const duration = (data.durationSec || 5) * 1000;
    alertTimer = setTimeout(() => {
      alertBanner.style.display = 'none';
      alertBanner.className = 'alert-box-inner';
      if (alertComboBadge) alertComboBadge.style.display = 'none';
    }, duration);
  }

  // Media / Video / GIF Trigger
  function stopMedia() {
    if (mediaTimer) {
      clearTimeout(mediaTimer);
      mediaTimer = null;
    }
    try {
      mediaVideo.pause();
      mediaVideo.currentTime = 0;
      mediaVideo.removeAttribute('src');
      mediaVideo.load();
    } catch (e) {}
    mediaVideo.style.display = 'none';
    mediaImage.style.display = 'none';
    const widgetVideo = document.getElementById('widget-video');
    if (widgetVideo) {
      const wDef = currentLayout.find(w => w.id === 'widget-video');
      if (wDef && wDef.enabled === false) {
        widgetVideo.style.display = 'none';
      }
    }
  }

  function playMedia(data) {
    stopMedia();

    let url = data.mediaUrl || data.url;
    if (!url) return;
    if (!url.startsWith('http') && !url.startsWith('/')) {
      url = '/' + url;
    }

    const widgetVideo = document.getElementById('widget-video');
    if (widgetVideo) {
      widgetVideo.style.display = 'flex';
      widgetVideo.style.zIndex = '9999';
    }

    const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.includes('video') || /\.(mp4|webm|mov|mkv)($|\?)/i.test(url);
    const animClass = `anim-${data.animation || 'fade'}`;

    if (isVideo) {
      mediaImage.style.display = 'none';
      mediaVideo.src = url;
      mediaVideo.className = animClass;

      const targetVol = data.volume !== undefined ? Math.max(0, Math.min(100, Number(data.volume))) / 100 : 1;
      mediaVideo.volume = targetVol;
      mediaVideo.muted = targetVol === 0;
      mediaVideo.style.display = 'block';

      // Load media explicitly before playback
      try { mediaVideo.load(); } catch (e) {}

      // Play with safe autoplay fallback
      const playPromise = mediaVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Video] Play with sound blocked, trying muted fallback:', err);
          mediaVideo.muted = true;
          mediaVideo.play().catch((e) => console.error('[Video] Play completely failed:', e));
        });
      }

      mediaVideo.onended = () => {
        stopMedia();
      };
      mediaVideo.onerror = (e) => {
        console.error('[Video Error]', e);
        stopMedia();
      };
    } else {
      try {
        mediaVideo.pause();
      } catch (e) {}
      mediaVideo.style.display = 'none';
      mediaImage.src = url;
      mediaImage.className = animClass;
      mediaImage.style.display = 'block';
    }

    const duration = (Number(data.durationSec || data.duration) || 6) * 1000;
    mediaTimer = setTimeout(() => {
      stopMedia();
    }, duration);
  }

  // Audio Context unlock listener for OBS and browsers
  const unlockAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
      }
    } catch (e) {}
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // Chat Bubble
  function addChatMessage(user, comment) {
    if (!comment) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    const avatarHtml = user?.avatar
      ? `<img class="chat-bubble-avatar" src="${user.avatar}" alt="Avatar" />`
      : `<div class="chat-bubble-avatar" style="background:#a855f7; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold;">${(user?.nickname || user?.username || 'U')[0]}</div>`;

    bubble.innerHTML = `
      ${avatarHtml}
      <div class="chat-bubble-content">
        <span class="chat-user">${escapeHtml(user?.nickname || user?.username || 'İzleyici')}</span>
        <span class="chat-text">${escapeHtml(comment)}</span>
      </div>
    `;

    chatContainer.appendChild(bubble);

    // Keep max 7 messages
    while (chatContainer.children.length > 7) {
      chatContainer.removeChild(chatContainer.firstChild);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Update Counters & Leaderboard with LiveInteract Crowns
  function updateCounters(counters) {
    if (!counters) return;
    currentCounters = counters;

    if (counterLikes && counters.totalLikes !== undefined) {
      counterLikes.textContent = counters.totalLikes.toLocaleString('tr-TR');
    }

    if (counterDiamonds && counters.totalDiamonds !== undefined) {
      counterDiamonds.textContent = counters.totalDiamonds.toLocaleString('tr-TR');
    }

    if (viewerCountEl && counters.liveViewers !== undefined) {
      viewerCountEl.textContent = counters.liveViewers.toLocaleString('tr-TR');
    }

    // Goal Bar update
    const goalWidget = currentLayout.find(w => w.type === 'goalBar');
    if (goalWidget && goalFill && goalFraction) {
      const target = goalWidget.goalTarget || 1000;
      let current = 0;
      if (goalWidget.goalType === 'like') current = counters.totalLikes || 0;
      else if (goalWidget.goalType === 'follower') current = counters.followerCount || 0;
      else current = counters.totalDiamonds || 0;

      const pct = Math.min(100, Math.round((current / target) * 100));
      goalFill.style.width = `${pct}%`;
      goalFraction.textContent = `${current.toLocaleString('tr-TR')} / ${target.toLocaleString('tr-TR')} (%${pct})`;
    }

    // Leaderboard update with Crowns
    if (leaderboardList && Array.isArray(counters.topGifters)) {
      if (counters.topGifters.length === 0) {
        leaderboardList.innerHTML = `<div class="empty-state">Henüz hediye gönderilmedi</div>`;
      } else {
        leaderboardList.innerHTML = counters.topGifters.slice(0, 5).map((g, i) => {
          let rankIcon = `#${i + 1}`;
          let rankClass = '';
          if (i === 0) { rankIcon = '👑 #1'; rankClass = 'rank-1'; }
          else if (i === 1) { rankIcon = '🥈 #2'; rankClass = 'rank-2'; }
          else if (i === 2) { rankIcon = '🥉 #3'; rankClass = 'rank-3'; }

          return `
            <div class="leaderboard-row">
              <span class="leaderboard-rank ${rankClass}">${rankIcon}</span>
              <img class="leaderboard-avatar" src="${g.avatar || 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png'}" />
              <span class="leaderboard-name">${escapeHtml(g.nickname || g.username)}</span>
              <span class="leaderboard-diamonds">${(g.diamonds || 0).toLocaleString('tr-TR')} 💎</span>
            </div>
          `;
        }).join('');
      }
    }

    // Ticker update
    if (counters.lastFollower && tickerFollower) {
      tickerFollower.textContent = counters.lastFollower.nickname || counters.lastFollower.username;
    }
    if (counters.lastGifter && tickerGift) {
      tickerGift.textContent = `${counters.lastGifter.nickname || counters.lastGifter.username}`;
    }
  }

  // LiveInteract: Top Liker
  function updateTopLiker(data) {
    const el = document.getElementById('widget-topliker');
    const nameEl = document.getElementById('topliker-name');
    const likesEl = document.getElementById('topliker-likes');
    const avatarEl = document.getElementById('topliker-avatar');
    if (!el || !data) return;

    if (nameEl) nameEl.textContent = data.user?.nickname || data.user?.username || 'Top Liker';
    if (likesEl) likesEl.textContent = Number(data.likeCount || 0).toLocaleString('tr-TR');
    if (avatarEl && data.user?.avatar) {
      avatarEl.src = data.user.avatar;
    }
    el.style.display = 'flex';
  }

  // LiveInteract: Mekan Sahibi (VIP Throne)
  function updateMekanSahibi(data) {
    const el = document.getElementById('widget-mekansahibi');
    const nameEl = document.getElementById('mekan-name');
    const diamondsEl = document.getElementById('mekan-diamonds');
    const avatarEl = document.getElementById('mekan-avatar');
    if (!el || !data) return;

    if (nameEl) nameEl.textContent = data.nickname || data.username || 'Mekan Sahibi';
    if (diamondsEl) diamondsEl.textContent = Number(data.diamonds || data.totalDiamonds || 0).toLocaleString('tr-TR');
    if (avatarEl && data.avatar) {
      avatarEl.src = data.avatar;
    }
    el.style.display = 'flex';
  }

  // LiveInteract: Kombo Mekan Sahibi (3D Celebration Card)
  let comboMekanTimer = null;
  function showComboMekanSahibi(data) {
    const widget = document.getElementById('widget-combomekansahibi');
    const nameEl = document.getElementById('combomekan-name');
    const avatarEl = document.getElementById('combomekan-avatar');
    const comboEl = document.getElementById('combomekan-combo');
    const diamondsEl = document.getElementById('combomekan-diamonds');
    const badgeEl = document.getElementById('combomekan-badge');
    if (!widget || !data) return;

    if (nameEl) nameEl.textContent = data.nickname || data.username || 'Kral Destekçi';
    if (avatarEl) {
      avatarEl.src = data.avatar || 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba762589531e0f09761bbca2c75a45b~tplv-obj.png';
    }
    if (comboEl) {
      const c = data.combo || data.repeatCount || data.count || 1;
      comboEl.textContent = `x${c} KOMBO! 🔥`;
    }
    if (diamondsEl) {
      const d = data.diamonds || data.totalDiamonds || 0;
      diamondsEl.textContent = `💎 ${Number(d).toLocaleString('tr-TR')}`;
    }
    if (badgeEl) {
      badgeEl.textContent = data.isNewMekan ? '👑 YENİ MEKAN SAHİBİ! 👑' : '🔥 MEKAN SAHİBİ KOMBOSU! 🔥';
    }

    widget.style.display = 'flex';
    triggerFireworkBurst();
    playSound('/default-sounds/tada.wav', 85);

    if (comboMekanTimer) clearTimeout(comboMekanTimer);
    const duration = (data.durationSec || 7) * 1000;
    comboMekanTimer = setTimeout(() => {
      const curPath = window.location.pathname;
      const isComboMekanOnly = curPath.includes('/combomekansahibi') || urlParams.get('widget') === 'combomekansahibi';
      if (!isComboMekanOnly) {
        widget.style.display = 'none';
      }
    }, duration);
  }

  // LiveInteract: 3D Fireworks Particle System
  const fwCanvas = document.getElementById('firework-canvas');
  let fwCtx = fwCanvas ? fwCanvas.getContext('2d') : null;
  let particles = [];
  let fwAnimId = null;

  function resizeFwCanvas() {
    if (!fwCanvas) return;
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeFwCanvas);
  resizeFwCanvas();

  function triggerFireworkBurst() {
    if (!fwCtx) return;
    const count = isPerfMode ? 25 : 60;
    const originX = window.innerWidth * (0.3 + Math.random() * 0.4);
    const originY = window.innerHeight * (0.2 + Math.random() * 0.4);
    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#06b6d4', '#eab308', '#10b981'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        decay: 0.015 + Math.random() * 0.02
      });
    }

    if (!fwAnimId) {
      loopFireworks();
    }
  }

  function loopFireworks() {
    if (!fwCtx) return;
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      fwCtx.save();
      fwCtx.globalAlpha = p.alpha;
      fwCtx.fillStyle = p.color;
      fwCtx.shadowColor = p.color;
      fwCtx.shadowBlur = 8;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fwCtx.fill();
      fwCtx.restore();
    }

    if (particles.length > 0) {
      fwAnimId = requestAnimationFrame(loopFireworks);
    } else {
      fwAnimId = null;
      fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    }
  }

  // WebSocket Connection with Auto Reconnect
  let socket = null;
  function connectWS() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws-overlay`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('[Overlay] Connected to TikFlow Server!');
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'overlay:init':
            currentSettings = msg.settings || currentSettings;
            updateScale();
            applyLayout(msg.layout);
            updateCounters(msg.counters);
            if (currentSettings && currentSettings.customCss !== undefined) {
              applyCustomCss(currentSettings.customCss);
            }
            break;

          case 'overlay:layout-update':
            applyLayout(msg.layout);
            break;

          case 'overlay:settings-update':
            currentSettings = msg.settings || currentSettings;
            updateScale();
            if (currentSettings && currentSettings.customCss !== undefined) {
              applyCustomCss(currentSettings.customCss);
            }
            break;

          case 'overlay:clear':
            if (alertTimer) clearTimeout(alertTimer);
            if (mediaTimer) clearTimeout(mediaTimer);
            alertBanner.style.display = 'none';
            mediaVideo.pause();
            mediaVideo.style.display = 'none';
            mediaImage.style.display = 'none';
            break;

          case 'alert':
            showAlert(msg);
            break;

          case 'media':
            playMedia(msg);
            break;

          case 'sound':
            playSound(msg.soundUrl, msg.volume);
            break;

          case 'tts':
            speakTTS(msg.text, msg.voice, msg.rate);
            break;

          case 'chat':
            addChatMessage(msg.user, msg.comment);
            break;

          case 'like':
            if (counterLikes && msg.totalLikes !== undefined) {
              counterLikes.textContent = msg.totalLikes.toLocaleString('tr-TR');
            }
            break;

          case 'follow':
            if (tickerFollower && msg.user) {
              tickerFollower.textContent = msg.user.nickname || msg.user.username;
            }
            break;

          case 'counters-update':
            updateCounters(msg.counters);
            break;

          case 'topliker:update':
            updateTopLiker(msg.topLiker);
            break;

          case 'mekansahibi:update':
            updateMekanSahibi(msg.mekanSahibi);
            break;

          case 'combomekansahibi:update':
            showComboMekanSahibi(msg.comboMekanSahibi || msg.data);
            break;

          case 'firework':
            triggerFireworkBurst();
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('[Overlay] Message parse error:', err);
      }
    };

    socket.onclose = () => {
      setTimeout(connectWS, 2000);
    };

    socket.onerror = (err) => {
      console.warn('[Overlay] WebSocket error:', err);
    };
  }

  connectWS();
})();
