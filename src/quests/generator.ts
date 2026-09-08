import type { ArcId, MissionClass } from '../core/types';
import { MASTER_ROADMAP } from '../data/roadmap';
import type { ThreatState } from '../core/types';

export function pickMissionClass(arc: ArcId = MASTER_ROADMAP.defaultArc, threat: ThreatState): MissionClass {
  // Basic heuristic: higher threat -> more STABILITY/RECOVERY; otherwise CORE or SIDE
  if (threat === 'CRITICAL' || threat === 'DANGER') return 'STABILITY';
  if (threat === 'WARNING') return 'RECOVERY';
  // Favor CORE as default
  return 'CORE';
}
