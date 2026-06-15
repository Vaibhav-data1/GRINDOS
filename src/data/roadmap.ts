import type { ArcId } from '../core/types';

export interface RoadmapPhase {
  id: string;
  years: [number, number];
  title: string;
  goals: string[];
  locked: true;
}

export interface MasterRoadmap {
  timeline: [number, number];
  plans: Record<'A' | 'B' | 'C' | 'D', string>;
  sharedFoundation: string[];
  phases: RoadmapPhase[];
  defaultArc: ArcId;
}

export const MASTER_ROADMAP: MasterRoadmap = {
  timeline: [2026, 2032],
  plans: {
    A: 'Builder / Startup Route',
    B: 'Foreign Scholarship Route',
    C: 'Foreign/Remote Job Route',
    D: 'Indian Job + Side Building Route',
  },
  sharedFoundation: ['coding', 'AI', 'projects', 'communication', 'adaptability', 'consistency', 'academics', 'health'],
  phases: [
    { id: 'PHASE_1', years: [2026, 2027], title: 'BASE', goals: ['foundations', 'discipline', 'consistency', 'Python', 'UI/UX', 'stability'], locked: true },
    { id: 'PHASE_2', years: [2027, 2028], title: 'SKILL STACKING', goals: ['backend', 'AI integrations', 'APIs', 'projects'], locked: true },
    { id: 'PHASE_3', years: [2028, 2029], title: 'LEVERAGE', goals: ['internships', 'public proof', 'income', 'networking'], locked: true },
    { id: 'PHASE_4', years: [2029, 2031], title: 'POSITIONING', goals: ['global optionality', 'startup validation', 'remote readiness'], locked: true },
    { id: 'PHASE_5', years: [2031, 2032], title: 'DECISION PHASE', goals: ['activate strongest realistic future path'], locked: true },
  ],
  defaultArc: 'SYSTEM_CREATOR_ARC',
};
