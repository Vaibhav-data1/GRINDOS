import type { GrindSession } from '../core/types';

export function getRemainingMs(session: GrindSession, now = Date.now()): number | null {
  if (session.infinite || !session.targetMs || !session.endsAt) return null;
  const pausedDrift = session.pausedAt ? now - session.pausedAt : 0;
  return session.endsAt - now + pausedDrift;
}

export function deriveSessionState(session: GrindSession, now = Date.now()): GrindSession['state'] {
  if (session.state === 'completed' || session.state === 'abandoned') return session.state;
  if (session.state === 'paused') return 'paused';
  const remaining = getRemainingMs(session, now);
  if (remaining === null) return 'active';
  return remaining <= 0 ? 'overtime' : 'active';
}

export function urgencyBand(session: GrindSession, now = Date.now()): 'calm' | 'warning' | 'pressure' | 'critical' | 'overtime' {
  const remaining = getRemainingMs(session, now);
  if (remaining === null || !session.targetMs) return 'calm';
  if (remaining <= 0) return 'overtime';
  const pct = remaining / session.targetMs;
  if (pct > 0.5) return 'calm';
  if (pct > 0.25) return 'warning';
  if (pct > 0.1) return 'pressure';
  return 'critical';
}
