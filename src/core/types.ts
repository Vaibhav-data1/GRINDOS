export type ThreatState = 'STABLE' | 'FOCUSED' | 'WARNING' | 'DANGER' | 'CRITICAL';

export type MissionClass = 'CORE' | 'STABILITY' | 'RECOVERY' | 'SIDE';
export type MissionPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' | 'S_RANK';
export type SessionState = 'active' | 'paused' | 'completed' | 'abandoned' | 'overtime';

export type ArcId =
  | 'EXAM_ARC'
  | 'RECONSTRUCTION_ARC'
  | 'WAR_ARC'
  | 'MONK_MODE_ARC'
  | 'FITNESS_ARC'
  | 'SYSTEM_CREATOR_ARC';

export interface Reminder {
  id: string;
  missionId: string;
  at: number;
  level: 'passive' | 'warning' | 'threat' | 'critical';
  deliveredAt?: number;
  acknowledgedAt?: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline?: number;
  durationMinutes?: number;
  xpReward: number;
  punishmentValue: number;
  repeatRule?: 'daily' | 'weekly' | 'custom';
  reminderIds: string[];
  priority: MissionPriority;
  missionClass: MissionClass;
  status: 'pending' | 'completed' | 'missed' | 'abandoned';
  completedAt?: number;
}

export interface GrindSession {
  id: string;
  state: SessionState;
  startedAt: number;
  endsAt?: number;
  pausedAt?: number;
  pausedMsTotal: number;
  infinite: boolean;
  targetMs?: number;
}
