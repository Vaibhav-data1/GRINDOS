import type { ThreatState } from '../core/types';

export interface BehavioralSignals {
  inactivityMinutes: number;
  missedMissions: number;
  ignoredReminders: number;
  sessionAbandons: number;
  recoveryCompletions: number;
  focusCompletions: number;
}

export function computeCorruptionDelta(s: BehavioralSignals): number {
  return (
    Math.floor(s.inactivityMinutes / 30) +
    s.missedMissions * 4 +
    s.ignoredReminders * 2 +
    s.sessionAbandons * 3 -
    s.recoveryCompletions * 3 -
    s.focusCompletions * 2
  );
}

export function clampCorruption(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function threatFromCorruption(corruption: number): ThreatState {
  if (corruption < 20) return 'STABLE';
  if (corruption < 40) return 'FOCUSED';
  if (corruption < 60) return 'WARNING';
  if (corruption < 80) return 'DANGER';
  return 'CRITICAL';
}
