# GRIND OS Master Implementation Blueprint

This document translates the master product prompt into an implementable architecture for a React + TypeScript PWA.

## 1) Product Pillars

- Behavioral OS, not a task list.
- Reactive emotional atmosphere tied to behavior.
- Sustainable ascension over burnout.
- Persistent operational memory (sessions, missions, reminders, state drift).

## 2) Core Domain Model

```ts
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
```

## 3) First-Launch-Only Onboarding

State machine:

1. `signal_detection`
2. `host_identification`
3. `binding_sequence`
4. `contract_sequence`
5. `arc_initialization`
6. `activation`
7. `complete`

Persistence rule:
- `onboarding.completedAt` in local storage / IndexedDB.
- On completion, route to dashboard and never replay unless explicit reset.

## 4) Locked Master Roadmap (2026–2032)

- Immutable base roadmap config in source.
- User can update progress markers, but cannot alter locked strategic skeleton.
- Plans A/B/C/D share same foundational competence graph.

## 5) Mission Engine

Mission fields:
- title, description, category, deadline, duration,
- xpReward, punishment, repeatRule,
- reminderSchedule (3–5), escalationPolicy,
- priority, missionClass.

Behavior:
- Completion grants XP/stability and can reduce corruption.
- Miss/ignore increases corruption and escalates threat.

## 6) Notification Nervous System

- Service worker + Notification API.
- Reminder queue persisted in IndexedDB.
- Re-hydration on app launch.
- Debug panel with simulated reminders and delivery logs.

## 7) Grind Session Engine

- Timestamp-driven countdown, not interval-driven absolute state.
- Survives refresh/minimize/reconnect.
- Overtime mode elevates pressure and corruption risk.
- Visual urgency bands:
  - 100–50: calm blue
  - 50–25: warning tint
  - 25–10: high pressure
  - <10: red takeover

## 8) Threat + Corruption Engine

Inputs:
- inactivity, missed missions, ignored reminders,
- streak collapse, session abandon,
- recovery completion, focus completion.

Outputs:
- threat state transitions
- corruption score (0–100)
- atmosphere profile consumed by UI theming layer.

## 9) Arc Profiles

Each arc defines:
- quest pool weights
- threat sensitivity multiplier
- XP pacing multiplier
- notification tone template
- UI atmospheric profile.

Current default active arc:
- `SYSTEM_CREATOR_ARC`

## 10) Curated Weighted Quest Generation

- No generic random pool.
- Generate from:
  - active arc profile,
  - threat state,
  - recent completion history,
  - recovery index,
  - streak quality.

## 11) Health Systems

- Fitness subsystem: workouts/hydration/stretch/sleep/recovery.
- Mental subsystem: meditation/journaling/overload/burnout risk.
- Mental recovery lowers threat escalation slope.

## 12) AI Operational Assistant Contract

The assistant should be tactical and restrained:
- phase-aware check-ins,
- contextual reminder generation,
- overload detection and pressure downshift,
- weekly/monthly operational review summaries.

## 13) Implementation Phases

Phase 1 (Foundation):
- Persistent state schema, onboarding machine, locked roadmap config.

Phase 2 (Core Reactivity):
- Threat/corruption reducers, session persistence, mission consequence loop.

Phase 3 (Nervous System):
- Service worker reminders, background notifications, debug panel.

Phase 4 (Adaptive Intelligence):
- Arc-weighted quests, assistant check-ins, weekly/monthly summaries.

Phase 5 (Polish + Performance):
- Atmosphere tuning, animation constraints, battery-conscious behavior.

## 14) Non-Goals

- Meme aesthetics.
- Overstimulating red visuals outside danger contexts.
- Punishment loops that induce hopelessness.

