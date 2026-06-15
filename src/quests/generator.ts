import type { ArcId, MissionClass, ThreatState } from '../core/types';

const arcWeights: Record<ArcId, Record<MissionClass, number>> = {
  EXAM_ARC: { CORE: 5, STABILITY: 3, RECOVERY: 2, SIDE: 1 },
  RECONSTRUCTION_ARC: { CORE: 2, STABILITY: 4, RECOVERY: 5, SIDE: 1 },
  WAR_ARC: { CORE: 6, STABILITY: 2, RECOVERY: 1, SIDE: 1 },
  MONK_MODE_ARC: { CORE: 4, STABILITY: 4, RECOVERY: 2, SIDE: 1 },
  FITNESS_ARC: { CORE: 3, STABILITY: 5, RECOVERY: 3, SIDE: 1 },
  SYSTEM_CREATOR_ARC: { CORE: 6, STABILITY: 3, RECOVERY: 2, SIDE: 2 },
};

export function pickMissionClass(arc: ArcId, threat: ThreatState): MissionClass {
  const weights = { ...arcWeights[arc] };
  if (threat === 'DANGER' || threat === 'CRITICAL') {
    weights.RECOVERY += 3;
    weights.STABILITY += 2;
  }
  const bag: MissionClass[] = [];
  (Object.keys(weights) as MissionClass[]).forEach((k) => {
    for (let i = 0; i < weights[k]; i += 1) bag.push(k);
  });
  return bag[Math.floor(Math.random() * bag.length)];
}
