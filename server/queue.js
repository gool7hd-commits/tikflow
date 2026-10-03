export class ConflictQueueManager {
  constructor(broadcastFn) {
    this.broadcast = broadcastFn;
    this.queues = new Map(); // key: location or 'global' -> array of items
    this.activeItems = new Map(); // key: location or 'global' -> currently running item
    this.timers = new Map(); // key: location or 'global' -> timeout handle
    this.cooldowns = new Map(); // key: autoId or `${autoId}:${userId}` -> timestamp
    this.maxQueueSize = 50;
  }

  setBroadcastFn(fn) {
    this.broadcast = fn;
  }

  isCooldownActive(autoId, cooldownSec, userId, userLimitSec) {
    const now = Date.now();
    if (cooldownSec > 0) {
      const last = this.cooldowns.get(`auto:${autoId}`);
      if (last && (now - last) < cooldownSec * 1000) {
        return true;
      }
    }
    if (userLimitSec > 0 && userId) {
      const userKey = `user:${autoId}:${userId}`;
      const lastUser = this.cooldowns.get(userKey);
      if (lastUser && (now - lastUser) < userLimitSec * 1000) {
        return true;
      }
    }
    return false;
  }

  recordCooldown(autoId, cooldownSec, userId, userLimitSec) {
    const now = Date.now();
    if (cooldownSec > 0) {
      this.cooldowns.set(`auto:${autoId}`, now);
    }
    if (userLimitSec > 0 && userId) {
      this.cooldowns.set(`user:${autoId}:${userId}`, now);
    }
  }

  enqueue(item) {
    const locationKey = `${item.type || 'global'}:${item.location || 'center'}`;
    const mode = item.conflictMode || 'queue'; // 'queue' | 'multi' | 'interrupt'

    if (mode === 'multi') {
      // Direct broadcast, no queueing
      this.broadcast(item);
      return;
    }

    if (mode === 'interrupt') {
      // Clear active timer, send stop command to overlay for this channel, and play immediately
      if (this.timers.has(locationKey)) {
        clearTimeout(this.timers.get(locationKey));
        this.timers.delete(locationKey);
      }
      this.activeItems.delete(locationKey);
      // tell overlay to interrupt
      this.broadcast({ ...item, interrupt: true });
      this.activeItems.set(locationKey, item);
      const duration = (item.durationSec || 5) * 1000;
      const timer = setTimeout(() => {
        this.timers.delete(locationKey);
        this.processNext(locationKey);
      }, duration);
      this.timers.set(locationKey, timer);
      return;
    }

    // mode === 'queue'
    if (!this.queues.has(locationKey)) {
      this.queues.set(locationKey, []);
    }
    const q = this.queues.get(locationKey);

    if (q.length >= this.maxQueueSize) {
      console.warn(`[Queue] Max queue limit reached for ${locationKey}. Dropping item.`);
      return;
    }

    q.push(item);

    // If nothing currently active, start playing next
    if (!this.activeItems.has(locationKey)) {
      this.processNext(locationKey);
    }
  }

  processNext(locationKey) {
    const q = this.queues.get(locationKey);
    if (!q || q.length === 0) {
      this.activeItems.delete(locationKey);
      return;
    }

    const nextItem = q.shift();
    this.activeItems.set(locationKey, nextItem);
    this.broadcast(nextItem);

    const duration = (nextItem.durationSec || 4) * 1000;
    const timer = setTimeout(() => {
      this.timers.delete(locationKey);
      this.processNext(locationKey);
    }, duration);

    this.timers.set(locationKey, timer);
  }

  clearQueue(locationKey = null) {
    if (locationKey) {
      if (this.queues.has(locationKey)) this.queues.set(locationKey, []);
      if (this.timers.has(locationKey)) {
        clearTimeout(this.timers.get(locationKey));
        this.timers.delete(locationKey);
      }
      this.activeItems.delete(locationKey);
    } else {
      this.queues.clear();
      for (const [_, timer] of this.timers) {
        clearTimeout(timer);
      }
      this.timers.clear();
      this.activeItems.clear();
    }
    // send overlay reset signal
    this.broadcast({ type: 'overlay:clear' });
  }

  getQueueStatus() {
    const status = {};
    for (const [key, q] of this.queues.entries()) {
      status[key] = {
        queueLength: q.length,
        hasActive: this.activeItems.has(key)
      };
    }
    return status;
  }
}

export default ConflictQueueManager;
