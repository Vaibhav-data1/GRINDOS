import type { Mission } from '../core/types';

export interface RewardResult {
  xpDelta: number;
  corruptionDelta: number;
  stabilityDelta: number;
}

export function rewardForMissionCompletion(mission: Mission): RewardResult {
  const baseStability = mission.missionClass === 'STABILITY' || mission.missionClass === 'RECOVERY' ? 4 : 2;
  return { xpDelta: mission.xpReward, corruptionDelta: -Math.max(1, Math.floor(mission.punishmentValue / 2)), stabilityDelta: baseStability };
}

export function punishmentForMissionFailure(mission: Mission): RewardResult {
  return { xpDelta: -mission.punishmentValue, corruptionDelta: mission.punishmentValue, stabilityDelta: -2 };
}
