import type { Mission } from '../core/types';

export interface MissionReward {
  xpDelta: number;
  stabilityDelta: number;
  corruptionDelta: number;
}

export function rewardForMissionCompletion(mission: Mission): MissionReward {
  // Simple deterministic reward model based on priority/class
  const baseXp = mission.missionClass === 'CORE' ? 120 : mission.missionClass === 'SIDE' ? 45 : 70;
  const xpDelta = Math.round(baseXp * (mission.priority === 'HIGH' || mission.priority === 'CRITICAL' ? 1.0 : 0.6));
  const stabilityDelta = mission.missionClass === 'RECOVERY' ? 6 : 2;
  const corruptionDelta = mission.missionClass === 'CORE' ? -2 : -1;
  return { xpDelta, stabilityDelta, corruptionDelta };
}
