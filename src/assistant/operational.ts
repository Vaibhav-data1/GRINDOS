import type { ArcId, ThreatState } from '../core/types';

export interface AssistantContext {
  currentPhase: string;
  arc: ArcId;
  threat: ThreatState;
  burnoutRisk: 'low' | 'medium' | 'high';
  shippedBuildThisWeek: boolean;
  pythonConsistencyScore: number;
}

export function generateCheckIn(c: AssistantContext): string {
  if (c.burnoutRisk === 'high') return 'Operational strain detected. Shift to Recovery Missions and stabilize sleep/hydration before next deep push.';
  if (!c.shippedBuildThisWeek) return 'No build shipped this week. Deploy one small artifact to maintain System Creator Arc momentum.';
  if (c.pythonConsistencyScore < 60) return 'Python progression below target. Schedule a focused 45-minute core mission today.';
  return `Phase ${c.currentPhase} stable. Continue arc ${c.arc} cadence and protect recovery.`;
}
