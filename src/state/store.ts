import { createStorage, loadJSON, saveJSON } from '../core/storage';
import type { GrindSession, Mission, Reminder, ThreatState } from '../core/types';

export interface AppState {
  xp: number;
  stability: number;
  corruption: number;
  threat: ThreatState;
  activeSession?: GrindSession;
  missions: Mission[];
  reminders: Reminder[];
  onboarding: { step: string; completedAt?: number };
}

const STORAGE_KEY = 'grindos.state.v1';

const initialState: AppState = {
  xp: 0,
  stability: 50,
  corruption: 10,
  threat: 'STABLE',
  missions: [],
  reminders: [],
  onboarding: { step: 'signal_detection' },
};

export class AppStore {
  private storage = createStorage();
  private state: AppState;

  constructor() {
    this.state = loadJSON(this.storage, STORAGE_KEY, initialState);
  }

  getState(): AppState {
    return this.state;
  }

  update(mutator: (state: AppState) => AppState): AppState {
    this.state = mutator(this.state);
    saveJSON(this.storage, STORAGE_KEY, this.state);
    return this.state;
  }
}
