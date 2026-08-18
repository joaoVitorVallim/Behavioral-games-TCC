type Listener = (...args: unknown[]) => void;

class EventBus {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(fn);
  }

  off(event: string, fn: Listener) {
    const list = this.listeners.get(event);
    if (list) this.listeners.set(event, list.filter(f => f !== fn));
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(fn => fn(...args));
  }

  removeAll(event: string) {
    this.listeners.set(event, []);
  }
}

export const eventBus = new EventBus();

export const GAME_EVENTS = {
  MATCH_READY: 'matchReady',
  ROUND_START: 'roundStart',
  CHOICE_RECEIVED: 'choiceReceived',
  ROUND_RESULT: 'roundResult',
  ROUND_TIMEOUT: 'roundTimeout',
  MATCH_FINISHED: 'matchFinished',
  PLAYER_DISCONNECTED: 'playerDisconnected',
} as const;

export const PLAYER_EVENTS = {
  SUBMIT_CHOICE: 'submitChoice',
} as const;

export const UI_EVENTS = {
  SCENE_DONE: 'sceneDone',
} as const;
