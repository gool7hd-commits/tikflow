import db from './db.js';
import eventBus from './eventBus.js';
import { obsService } from './obs.js';
import { formatTtsText } from './tts.js';
import { findGift } from '../shared/giftCatalog.js';

export class AutomationEngine {
  constructor(queueManager) {
    this.queueManager = queueManager;
    this.likeAccumulator = 0;
    this.timerIntervals = new Map();
    this.init();
  }

  init() {
    eventBus.on('stream-event', (event) => this.handleEvent(event));
    this.setupTimers();
  }

  setupTimers() {
    // Clear existing
    for (const [_, timer] of this.timerIntervals) {
      clearInterval(timer);
    }
    this.timerIntervals.clear();

    const automations = db.getAllAutomations();
    automations.forEach(auto => {
      if (auto.aktif && auto.tetikleyici?.type === 'timer') {
        const minutes = Number(auto.tetikleyici.config?.minutes) || 5;
        const intervalMs = Math.max(minutes * 60 * 1000, 10000);
        const timer = setInterval(() => {
          this.executeAutomation(auto, {
            type: 'timer',
            user: { nickname: 'Zamanlayıcı', username: 'system', avatar: '' },
            timestamp: new Date().toISOString(),
            isSimulation: false
          });
        }, intervalMs);
        this.timerIntervals.set(auto.id, timer);
      }
    });
  }

  handleEvent(event) {
    // 1. Update general counters
    if (event.type === 'like') {
      const added = event.likeCount || 1;
      this.likeAccumulator += added;
      db.updateCounters({ likes: added });
    } else if (event.type === 'gift') {
      const diamonds = event.gift.totalDiamonds || (event.gift.diamonds * (event.gift.count || 1));
      db.updateCounters({
        diamonds,
        gifter: event.user
      });
    } else if (event.type === 'follow') {
      db.updateCounters({ follower: event.user });
    }

    // 2. Fetch automations for active profile
    const activeProfileId = db.getActiveProfileId();
    const automations = db.getAutomations(activeProfileId).filter(a => a.aktif);

    let matchedAny = false;

    for (const rule of automations) {
      if (this.matchesTrigger(rule.tetikleyici, event)) {
        matchedAny = true;
        this.executeAutomation(rule, event);
      }
    }

    // Always log non-simulation events to history even if no automation caught it (or log them as raw)
    if (!matchedAny && !event.isSimulation) {
      db.addHistory({
        type: event.type,
        user: event.user,
        gift: event.gift,
        comment: event.comment,
        ruleName: 'Eşleşen Kural Yok',
        status: 'unhandled'
      });
    }
  }

  matchesActor(actor, event, specificUser) {
    if (!actor || actor === 'everyone') return true;
    if (actor === 'subscriber') {
      return !!(event.user?.isSubscriber || event.isSubscriber);
    }
    if (actor === 'moderator') {
      return !!(event.user?.isModerator || event.isModerator);
    }
    if (actor === 'top_gifter') {
      const topGifters = db.getCounters().topGifters || [];
      const top = topGifters[0];
      if (!top) return false;
      return (event.user?.username && top.username && event.user.username.toLowerCase() === top.username.toLowerCase());
    }
    if (actor === 'specific_user') {
      if (!specificUser) return true;
      const target = specificUser.replace(/^@/, '').toLowerCase().trim();
      const user = (event.user?.username || '').replace(/^@/, '').toLowerCase().trim();
      return user === target;
    }
    return true;
  }

  matchesTrigger(trigger, event) {
    if (!trigger || !trigger.type) return false;

    // Check actor first
    const actor = trigger.actor || trigger.config?.actor || 'everyone';
    const specificUser = trigger.specificUser || trigger.config?.specificUser || '';
    if (!this.matchesActor(actor, event, specificUser)) {
      return false;
    }

    const cfg = trigger.config || {};
    const trgType = trigger.type;

    // Normalized event type mapping
    if (trgType === 'first_activity') {
      const u = event.user?.username || event.user?.id;
      if (!u) return false;
      if (!this.seenUsers) this.seenUsers = new Set();
      if (this.seenUsers.has(u)) return false;
      this.seenUsers.add(u);
      return true;
    }

    if (trgType === 'join' || trgType === 'member') {
      return event.type === 'member' || event.type === 'join';
    }

    if (trgType === 'share') {
      return event.type === 'share';
    }

    if (trgType === 'follow') {
      return event.type === 'follow';
    }

    if (trgType === 'subscribe') {
      return event.type === 'subscribe';
    }

    if (trgType === 'like') {
      if (event.type !== 'like') return false;
      const step = Number(cfg.step || trigger.step) || 1000;
      if (this.likeAccumulator >= step) {
        this.likeAccumulator = 0;
        return true;
      }
      return false;
    }

    if (trgType === 'chat' || trgType === 'comment') {
      if (event.type !== 'chat' && event.type !== 'comment') return false;
      if (!event.comment) return false;
      const kw = (cfg.keyword || trigger.keyword || '').toLowerCase().trim();
      if (!kw) return true;
      return event.comment.toLowerCase().includes(kw);
    }

    if (trgType === 'command') {
      if (event.type !== 'chat' && event.type !== 'comment') return false;
      if (!event.comment) return false;
      const cmd = (cfg.command || trigger.command || '!').toLowerCase().trim();
      return event.comment.toLowerCase().startsWith(cmd) || event.comment.toLowerCase().includes(cmd);
    }

    if (trgType === 'min_coins') {
      if (event.type !== 'gift' || !event.gift) return false;
      const min = Number(cfg.minDiamonds || trigger.minDiamonds || cfg.minCoins || trigger.minCoins) || 1;
      const d = event.gift.diamonds || 0;
      return d >= min;
    }

    if (trgType === 'gift' || trgType === 'specific_gift') {
      if (event.type !== 'gift' || !event.gift) return false;
      
      // Streak check
      if (cfg.onlyStreakEnd && event.gift.repeatEnd === false && (event.gift.count || 1) > 1) {
        return false;
      }

      // Count check
      if (cfg.minCount && (event.gift.count || 1) < cfg.minCount) {
        return false;
      }

      // If specific gift match is required
      const targetGiftName = cfg.giftName || trigger.giftName;
      const targetTurkish = cfg.turkishName || trigger.turkishName;
      const targetGiftId = cfg.giftId || trigger.giftId;

      if (trgType === 'specific_gift' || cfg.matchType === 'specific' || targetGiftName || targetTurkish || targetGiftId) {
        const ruleTargets = [
          targetGiftName,
          targetTurkish,
          targetGiftId ? String(targetGiftId) : null
        ].filter(Boolean).map((s) => String(s).toLowerCase().trim());

        if (ruleTargets.length === 0) return true;

        const eventTargets = [
          event.gift.name,
          event.gift.turkishName,
          event.gift.id ? String(event.gift.id) : null,
          event.gift.slug
        ].filter(Boolean).map((s) => String(s).toLowerCase().trim());

        return ruleTargets.some((r) =>
          eventTargets.some((e) => e === r || e.includes(r) || r.includes(e))
        );
      }

      if (cfg.matchType === 'diamonds') {
        const d = event.gift.diamonds || 0;
        const min = cfg.minDiamonds !== undefined ? Number(cfg.minDiamonds) : 0;
        const max = cfg.maxDiamonds !== undefined ? Number(cfg.maxDiamonds) : Infinity;
        return d >= min && d <= max;
      }

      return true;
    }

    return trigger.type === event.type || trigger.type === 'any';
  }

  async executeAutomation(rule, event) {
    const userId = event.user?.id || event.user?.username;

    // Check cooldown
    if (this.queueManager.isCooldownActive(rule.id, rule.cooldownSec, userId, rule.userLimitSec)) {
      console.log(`[Engine] Cooldown active for rule: ${rule.ad}. Skipped.`);
      return;
    }

    this.queueManager.recordCooldown(rule.id, rule.cooldownSec, userId, rule.userLimitSec);

    // Prepare variable context
    const variables = {
      kullanici: event.user?.nickname || event.user?.username || 'İzleyici',
      kullanici_adi: event.user?.username || '',
      hediye: event.gift?.turkishName || event.gift?.name || 'Hediye',
      adet: String(event.gift?.count || 1),
      jeton: String(event.gift?.diamonds || 0),
      toplam_jeton: String(event.gift?.totalDiamonds || (event.gift?.diamonds * (event.gift?.count || 1)) || 0),
      yorum: event.comment || '',
      begeni: String(event.likeCount || 1)
    };

    let executionError = null;

    try {
      const actions = rule.aksiyonlar || [];
      
      // Calculate multiplier
      const repeatCount = (rule.multiplier && event.gift?.count > 1) ? event.gift.count : 1;

      // Handle linked actionIds from "Yeni Eylem" library
      if (Array.isArray(rule.actionIds) && rule.actionIds.length > 0) {
        const allSavedActions = db.getActions() || [];
        let selectedActionIds = [...rule.actionIds];
        if (rule.randomAction && selectedActionIds.length > 1) {
          selectedActionIds = [selectedActionIds[Math.floor(Math.random() * selectedActionIds.length)]];
        }

        for (const actId of selectedActionIds) {
          const savedAct = allSavedActions.find((a) => a.id === actId);
          if (!savedAct) continue;

          // Video
          if (savedAct.types?.video && savedAct.videoUrl) {
            this.queueManager.enqueue({
              type: 'media',
              ruleId: rule.id,
              conflictMode: rule.conflictMode || 'queue',
              mediaUrl: savedAct.videoUrl,
              durationSec: Number(savedAct.duration) || 6,
              volume: savedAct.volume !== undefined ? Number(savedAct.volume) : 100,
              animation: 'fade',
              location: 'center',
              repeatCount
            });
          }

          // Sound
          if (savedAct.types?.sound && savedAct.soundUrl) {
            this.queueManager.enqueue({
              type: 'sound',
              ruleId: rule.id,
              conflictMode: 'multi',
              soundUrl: savedAct.soundUrl,
              volume: savedAct.volume !== undefined ? Number(savedAct.volume) : 80,
              durationSec: Number(savedAct.duration) || 3
            });
          }

          // Alert
          if (savedAct.types?.alert && savedAct.alertText) {
            this.queueManager.enqueue({
              type: 'alert',
              ruleId: rule.id,
              conflictMode: rule.conflictMode || 'queue',
              durationSec: Number(savedAct.duration) || 5,
              text: this.replaceVars(savedAct.alertText, variables),
              subText: this.replaceVars(savedAct.alertSubText || '', variables),
              animation: 'zoom',
              userAvatar: event.user?.avatar,
              giftIcon: event.gift?.icon || findGift(event.gift?.name)?.icon,
              location: 'center'
            });
          }

          // TTS
          if (savedAct.types?.tts && savedAct.ttsText) {
            const ttsText = formatTtsText(savedAct.ttsText, variables);
            this.queueManager.enqueue({
              type: 'tts',
              ruleId: rule.id,
              conflictMode: 'queue',
              text: ttsText,
              voice: 'tr-TR',
              rate: 1.0,
              durationSec: 4
            });
          }

          // OBS Scene
          if (savedAct.types?.obsScene && savedAct.obsSceneName) {
            obsService.switchScene(savedAct.obsSceneName);
          }

          // OBS Source
          if (savedAct.types?.obsSource && savedAct.obsSourceName) {
            obsService.setSourceVisibility(savedAct.obsSceneName || '', savedAct.obsSourceName, true);
          }
        }
      }

      for (const act of actions) {
        // Replace templates
        const renderedText = this.replaceVars(act.text, variables);
        const renderedSubText = this.replaceVars(act.subText, variables);

        if (act.type === 'alert') {
          this.queueManager.enqueue({
            type: 'alert',
            ruleId: rule.id,
            conflictMode: rule.conflictMode || 'queue',
            durationSec: (act.duration || 5),
            text: renderedText,
            subText: renderedSubText,
            animation: act.animation || 'zoom',
            userAvatar: event.user?.avatar,
            giftIcon: event.gift?.icon || findGift(event.gift?.name)?.icon,
            location: act.location || 'center'
          });
        } else if (act.type === 'media' || act.type === 'video') {
          // If random pool is enabled and multiple media are given
          let chosenUrl = act.mediaUrl || act.fileUrl;
          if (rule.randomPool && Array.isArray(act.mediaPool) && act.mediaPool.length > 0) {
            chosenUrl = act.mediaPool[Math.floor(Math.random() * act.mediaPool.length)];
          }

          this.queueManager.enqueue({
            type: 'media',
            ruleId: rule.id,
            conflictMode: rule.conflictMode || 'queue',
            mediaUrl: chosenUrl,
            durationSec: (act.duration || 5),
            animation: act.animation || 'fade',
            volume: act.volume !== undefined ? act.volume : 100,
            x: act.x,
            y: act.y,
            width: act.width,
            height: act.height,
            opacity: act.opacity,
            location: act.location || 'center',
            repeatCount
          });
        } else if (act.type === 'sound') {
          this.queueManager.enqueue({
            type: 'sound',
            ruleId: rule.id,
            conflictMode: rule.conflictMode || 'multi', // sounds default multi
            soundUrl: act.soundUrl || act.fileUrl,
            volume: act.volume !== undefined ? act.volume : 80,
            durationSec: act.duration || 3
          });
        } else if (act.type === 'tts') {
          const ttsText = formatTtsText(act.ttsTemplate || '{kullanici}: {yorum}', variables);
          this.queueManager.enqueue({
            type: 'tts',
            ruleId: rule.id,
            conflictMode: 'queue',
            text: ttsText,
            voice: act.voice || 'tr-TR',
            rate: act.rate || 1.0,
            durationSec: 4
          });
        } else if (act.type === 'obs') {
          if (act.obsAction === 'switchScene' && act.sceneName) {
            obsService.switchScene(act.sceneName);
          } else if (act.obsAction === 'toggleSource') {
            obsService.setSourceVisibility(act.sceneName, act.sourceId, act.visible);
          }
        } else if (act.type === 'webhook' && act.webhookUrl) {
          fetch(act.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rule: rule.ad, event, variables })
          }).catch(e => console.warn('[Webhook] Error:', e.message));
        }
      }
    } catch (err) {
      executionError = err.message;
      console.error(`[Engine] Error executing rule ${rule.ad}:`, err);
    }

    // Log to History
    db.addHistory({
      type: event.type,
      user: event.user,
      gift: event.gift,
      comment: event.comment,
      ruleName: rule.ad,
      ruleId: rule.id,
      status: executionError ? 'error' : 'triggered',
      error: executionError
    });
  }

  replaceVars(str, vars) {
    if (!str) return '';
    let res = str;
    for (const [k, v] of Object.entries(vars)) {
      res = res.replace(new RegExp(`\\{${k}\\}`, 'gi'), v || '');
    }
    return res;
  }
}

export default AutomationEngine;
