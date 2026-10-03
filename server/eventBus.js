import { EventEmitter } from 'events';

class TikFlowEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  emitNormalized(event) {
    this.emit('stream-event', event);
    this.emit(`stream-event:${event.type}`, event);
  }
}

export const eventBus = new TikFlowEventBus();
export default eventBus;
