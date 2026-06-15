import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppState } from '../state/store';
import { AppStore } from '../state/store';
import type { Mission, MissionClass, MissionPriority, Reminder } from '../core/types';
import { MASTER_ROADMAP } from '../data/roadmap';
import { advanceOnboarding } from '../onboarding/machine';
import { rewardForMissionCompletion } from '../missions/engine';
import { clampCorruption, threatFromCorruption } from '../engines/threat';
import { deriveSessionState, getRemainingMs, urgencyBand } from '../sessions/engine';
import { pendingReminders } from '../notifications/scheduler';
import { pickMissionClass } from '../quests/generator';
import { generateCheckIn } from '../assistant/operational';

const store = new AppStore();


function Icon({ name }: { name: string }) {
  const glyphs: Record<string, string> = {
    activity: '≋', bell: '◌', brain: '◈', check: '✓', flame: '△', home: '⌂', map: '◇', moon: '◑', play: '▶', plus: '+', radar: '◎', shield: '⬡', sparkles: '✦', sun: '☼', target: '⊙', timer: '◷', trophy: '♜'
  };
  return <span aria-hidden="true" className="inline-flex h-[18px] w-[18px] items-center justify-center text-base leading-none">{glyphs[name] ?? '•'}</span>;
}


type View = 'dashboard' | 'missions' | 'session' | 'roadmap' | 'assistant';
type Theme = 'dark' | 'light';

const missionTemplates: Record<MissionClass, string[]> = {
  CORE: ['Python study block', 'Build one GRIND OS feature', 'UI/UX practice sprint', 'Ship a small artifact'],
  STABILITY: ['Hydration reset', 'Recovery walk', 'Stretch protocol', 'Sleep protection audit'],
  RECOVERY: ['Box breathing sequence', 'Ten-minute cleanup', 'Recovery meditation', 'Reduce workload scan'],
  SIDE: ['Dashboard inspiration scan', 'Soundscape curation', 'Interface experiment', 'Roadmap note refinement'],
};

const priorityOrder: MissionPriority[] = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL', 'S_RANK'];

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatMs(ms: number | null) {
  if (ms === null) return '∞';
  const safe = Math.max(0, ms);
  const minutes = Math.floor(safe / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((safe % 60000) / 1000).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function createMission(missionClass: MissionClass): Mission {
  const titlePool = missionTemplates[missionClass];
  const title = titlePool[Math.floor(Math.random() * titlePool.length)];
  const priority = missionClass === 'CORE' ? 'HIGH' : missionClass === 'RECOVERY' ? 'NORMAL' : 'LOW';
  const id = uid('mission');
  return {
    id,
    title,
    description: `${missionClass.toLowerCase()} operation generated from System Creator Arc context.`,
    category: missionClass.toLowerCase(),
    deadline: Date.now() + 4 * 60 * 60 * 1000,
    durationMinutes: missionClass === 'CORE' ? 45 : 15,
    xpReward: missionClass === 'CORE' ? 120 : missionClass === 'SIDE' ? 45 : 70,
    punishmentValue: missionClass === 'CORE' ? 12 : 6,
    repeatRule: missionClass === 'STABILITY' ? 'daily' : undefined,
    reminderIds: [],
    priority,
    missionClass,
    status: 'pending',
  };
}

function createReminder(missionId: string, offsetMinutes: number, level: Reminder['level']): Reminder {
  return { id: uid('reminder'), missionId, at: Date.now() + offsetMinutes * 60_000, level };
}

function AppShell() {
  const [state, setState] = useState<AppState>(() => store.getState());
  const [view, setView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('grindos.theme') as Theme) || 'dark');
  const [, setTick] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('grindos.theme', theme);
  }, [theme]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setState(store.update((current) => {
      const activeSession = current.activeSession ? { ...current.activeSession, state: deriveSessionState(current.activeSession) } : undefined;
      const overdue = current.missions.filter((m) => m.status === 'pending' && m.deadline && m.deadline < Date.now()).length;
      const nextCorruption = clampCorruption(current.corruption + overdue);
      return { ...current, activeSession, corruption: nextCorruption, threat: threatFromCorruption(nextCorruption) };
    }));
  }, []);

  const activePendingReminders = useMemo(() => pendingReminders(state.reminders), [state.reminders]);
  const pendingMissions = state.missions.filter((m) => m.status === 'pending');
  const completedMissions = state.missions.filter((m) => m.status === 'completed');
  const rankProgress = Math.min(100, state.xp % 1000 / 10);
  const threatTone = state.threat === 'CRITICAL' || state.threat === 'DANGER' ? 'from-red-500/25' : 'from-cyan-500/25';

  function mutate(mutator: (s: AppState) => AppState) {
    setState(store.update(mutator));
  }

  function completeOnboarding() {
    let next = state.onboarding as { step: 'signal_detection' | 'host_identification' | 'binding_sequence' | 'contract_sequence' | 'arc_initialization' | 'activation' | 'complete'; completedAt?: number };
    while (next.step !== 'complete') next = advanceOnboarding(next);
    mutate((s) => ({ ...s, onboarding: next }));
  }

  function generateMission() {
    const missionClass = pickMissionClass(MASTER_ROADMAP.defaultArc, state.threat);
    const mission = createMission(missionClass);
    const reminders = [
      createReminder(mission.id, 0, 'passive'),
      createReminder(mission.id, 60, 'warning'),
      createReminder(mission.id, 120, 'threat'),
      createReminder(mission.id, 180, 'critical'),
    ];
    mutate((s) => ({ ...s, missions: [{ ...mission, reminderIds: reminders.map((r) => r.id) }, ...s.missions], reminders: [...s.reminders, ...reminders] }));
  }

  function completeMission(id: string) {
    mutate((s) => {
      const mission = s.missions.find((m) => m.id === id);
      if (!mission) return s;
      const reward = rewardForMissionCompletion(mission);
      const corruption = clampCorruption(s.corruption + reward.corruptionDelta);
      return {
        ...s,
        xp: Math.max(0, s.xp + reward.xpDelta),
        stability: Math.min(100, Math.max(0, s.stability + reward.stabilityDelta)),
        corruption,
        threat: threatFromCorruption(corruption),
        missions: s.missions.map((m) => m.id === id ? { ...m, status: 'completed', completedAt: Date.now() } : m),
      };
    });
  }

  function startSession(minutes: number | 'infinite') {
    const now = Date.now();
    mutate((s) => ({
      ...s,
      activeSession: {
        id: uid('session'),
        state: 'active',
        startedAt: now,
        endsAt: minutes === 'infinite' ? undefined : now + minutes * 60_000,
        pausedMsTotal: 0,
        infinite: minutes === 'infinite',
        targetMs: minutes === 'infinite' ? undefined : minutes * 60_000,
      },
    }));
  }

  function finishSession() {
    mutate((s) => {
      const corruption = clampCorruption(s.corruption - 4);
      return { ...s, xp: s.xp + 80, corruption, threat: threatFromCorruption(corruption), activeSession: s.activeSession ? { ...s.activeSession, state: 'completed' } : undefined };
    });
  }

  if (!state.onboarding.completedAt) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const views = {
    dashboard: <Dashboard state={state} pendingMissions={pendingMissions} completedCount={completedMissions.length} rankProgress={rankProgress} generateMission={generateMission} completeMission={completeMission} />,
    missions: <Missions missions={state.missions} completeMission={completeMission} generateMission={generateMission} />,
    session: <SessionPanel session={state.activeSession} startSession={startSession} finishSession={finishSession} />,
    roadmap: <Roadmap />,
    assistant: <AssistantPanel state={state} reminders={activePendingReminders.length} />,
  } satisfies Record<View, ReactNode>;

  return (
    <div className={`min-h-screen overflow-hidden bg-slate-950 text-slate-100 transition-colors light:bg-slate-100 light:text-slate-950`}>
      <div className={`fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,.16),transparent_40%)] ${threatTone} pointer-events-none`} />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-6">
        <header className="mb-6 flex items-center justify-between rounded-3xl border border-cyan-400/15 bg-slate-900/70 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur light:bg-white/80">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">GRIND OS</p>
            <h1 className="text-2xl font-black tracking-tight">Operational Command</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThreatBadge threat={state.threat} />
            <button className="rounded-2xl border border-cyan-300/20 p-3 hover:bg-cyan-400/10" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              {theme === 'dark' ? <Icon name="sun" /> : <Icon name="moon" />}
            </button>
          </div>
        </header>
        <main className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
          <DesktopNav view={view} setView={setView} />
          <section className="min-w-0 animate-[fadeIn_.35s_ease]">{views[view]}</section>
        </main>
      </div>
      <BottomNav view={view} setView={setView} />
    </div>
  );
}

function Onboarding({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="min-h-screen bg-black text-cyan-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,.25)_0,transparent_28%),linear-gradient(115deg,transparent_0_45%,rgba(56,189,248,.10)_45%_46%,transparent_47%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/30 px-4 py-2 text-xs uppercase tracking-[.35em] text-cyan-300">
          <Icon name="radar" /> Signal Detected
        </div>
        <h1 className="text-5xl font-black tracking-tighter sm:text-7xl">System binding requires host identification.</h1>
        <p className="mt-6 max-w-xl text-lg text-slate-300">Behavioral synchronization is available. Establish your operating identity, lock the roadmap, and activate sustainable ascension.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {['Codename: Operator', 'Arc: System Creator', 'Contract: I refuse regression'].map((item) => <div key={item} className="rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-5 shadow-xl shadow-cyan-950/30">{item}</div>)}
        </div>
        <button onClick={onComplete} className="mt-10 w-full rounded-3xl bg-cyan-300 px-6 py-4 font-black text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:scale-[1.01] sm:w-fit">Initialize GRIND OS</button>
      </div>
    </div>
  );
}

function Dashboard({ state, pendingMissions, completedCount, rankProgress, generateMission, completeMission }: { state: AppState; pendingMissions: Mission[]; completedCount: number; rankProgress: number; generateMission: () => void; completeMission: (id: string) => void }) {
  return <div className="space-y-5">
    <div className="grid gap-4 md:grid-cols-4">
      <Metric icon={<Icon name="trophy" />} label="XP" value={state.xp.toString()} accent="cyan" />
      <Metric icon={<Icon name="shield" />} label="Stability" value={`${state.stability}%`} accent="emerald" />
      <Metric icon={<Icon name="flame" />} label="Corruption" value={`${state.corruption}%`} accent="red" />
      <Metric icon={<Icon name="target" />} label="Streak" value={`${completedCount} ops`} accent="violet" />
    </div>
    <Panel className="p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><p className="text-sm uppercase tracking-[.25em] text-cyan-300">Rank Synchronization</p><h2 className="text-3xl font-black">Sustainable Ascension Protocol</h2></div>
        <button onClick={generateMission} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950"><Icon name="plus" /> Generate Quest</button>
      </div>
      <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-800 light:bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" style={{ width: `${rankProgress}%` }} /></div>
    </Panel>
    <div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
      <Panel className="p-5"><h3 className="mb-4 text-xl font-black">Active Missions</h3><MissionList missions={pendingMissions.slice(0, 5)} completeMission={completeMission} /></Panel>
      <Panel className="p-5"><h3 className="mb-4 text-xl font-black">Operational Analytics</h3><div className="space-y-3 text-sm text-slate-300 light:text-slate-600"><p>Threat state is computed from corruption and behavioral instability.</p><p>Recovery and stability missions reduce escalation pressure.</p><p>Core missions create the strongest XP momentum.</p></div></Panel>
    </div>
  </div>;
}

function Missions({ missions, completeMission, generateMission }: { missions: Mission[]; completeMission: (id: string) => void; generateMission: () => void }) {
  return <Panel className="p-5"><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-black">Mission Control</h2><button onClick={generateMission} className="rounded-2xl border border-cyan-300/30 px-4 py-2 text-cyan-200 light:text-cyan-700">New Mission</button></div><MissionList missions={missions} completeMission={completeMission} /></Panel>;
}

function SessionPanel({ session, startSession, finishSession }: { session?: AppState['activeSession']; startSession: (m: number | 'infinite') => void; finishSession: () => void }) {
  const remaining = session ? getRemainingMs(session) : null;
  const band = session ? urgencyBand(session) : 'calm';
  return <Panel className="p-6 text-center"><p className="text-sm uppercase tracking-[.3em] text-cyan-300">Grind Session</p><h2 className={`mt-3 text-7xl font-black ${band === 'critical' || band === 'overtime' ? 'text-red-400' : 'text-cyan-200 light:text-cyan-700'}`}>{session ? formatMs(remaining) : 'READY'}</h2><p className="mt-3 text-slate-400">State: {session ? deriveSessionState(session).toUpperCase() : 'IDLE'}</p><div className="mt-8 grid gap-3 sm:grid-cols-4"><Action label="25 min" onClick={() => startSession(25)} /><Action label="45 min" onClick={() => startSession(45)} /><Action label="∞ Mode" onClick={() => startSession('infinite')} /><Action label="Complete" onClick={finishSession} /></div></Panel>;
}

function Roadmap() {
  return <div className="space-y-4">{MASTER_ROADMAP.phases.map((phase) => <Panel key={phase.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[.3em] text-cyan-300">{phase.years[0]}–{phase.years[1]}</p><h3 className="text-2xl font-black">{phase.title}</h3><p className="mt-2 text-slate-400">{phase.goals.join(' • ')}</p></div><span className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs">LOCKED</span></div></Panel>)}</div>;
}

function AssistantPanel({ state, reminders }: { state: AppState; reminders: number }) {
  const checkIn = generateCheckIn({ currentPhase: 'PHASE_1', arc: MASTER_ROADMAP.defaultArc, threat: state.threat, burnoutRisk: state.corruption > 70 ? 'high' : state.corruption > 45 ? 'medium' : 'low', shippedBuildThisWeek: state.missions.some((m) => m.status === 'completed' && m.missionClass === 'CORE'), pythonConsistencyScore: Math.max(20, state.stability) });
  return <Panel className="p-6"><div className="mb-4 flex items-center gap-3"><span className="text-cyan-300"><Icon name="brain" /></span><h2 className="text-2xl font-black">Operational Intelligence</h2></div><p className="rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-5 text-lg">{checkIn}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric icon={<Icon name="bell" />} label="Pending Signals" value={String(reminders)} accent="cyan" /><Metric icon={<Icon name="activity" />} label="Threat" value={state.threat} accent="red" /><Metric icon={<Icon name="sparkles" />} label="Arc" value="Creator" accent="violet" /></div></Panel>;
}

function MissionList({ missions, completeMission }: { missions: Mission[]; completeMission: (id: string) => void }) {
  if (missions.length === 0) return <p className="rounded-3xl border border-dashed border-cyan-300/20 p-8 text-center text-slate-400">No missions active. Generate a contextual operation.</p>;
  return <div className="space-y-3">{missions.map((m) => <div key={m.id} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[.03] p-4 light:border-slate-200 light:bg-white"><div><div className="flex flex-wrap items-center gap-2"><h4 className="font-bold">{m.title}</h4><span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs text-cyan-300">{m.missionClass}</span><span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200 light:bg-slate-200 light:text-slate-700">{priorityOrder.indexOf(m.priority) + 1}</span></div><p className="mt-1 text-sm text-slate-400">{m.description}</p></div>{m.status === 'pending' ? <button onClick={() => completeMission(m.id)} className="rounded-2xl bg-emerald-400 px-3 py-2 font-bold text-slate-950"><Icon name="check" /></button> : <span className="text-emerald-300">Complete</span>}</div>)}</div>;
}

function Metric({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent: string }) {
  const accentText = accent === 'red' ? 'text-red-300' : accent === 'emerald' ? 'text-emerald-300' : accent === 'violet' ? 'text-violet-300' : 'text-cyan-300';
  return <Panel className="p-4"><div className={`flex items-center justify-between ${accentText}`}>{icon}<span className="text-xs uppercase tracking-[.2em] text-slate-400">{label}</span></div><div className="mt-3 text-3xl font-black">{value}</div></Panel>;
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[2rem] border border-cyan-300/15 bg-slate-900/70 shadow-2xl shadow-cyan-950/20 backdrop-blur light:bg-white/85 light:shadow-slate-300/40 ${className}`}>{children}</div>;
}

function ThreatBadge({ threat }: { threat: AppState['threat'] }) {
  return <div className={`hidden rounded-2xl px-3 py-2 text-xs font-black sm:block ${threat === 'DANGER' || threat === 'CRITICAL' ? 'bg-red-500/20 text-red-200' : 'bg-cyan-300/10 text-cyan-200 light:text-cyan-700'}`}>{threat}</div>;
}

const navItems: { view: View; label: string; icon: ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <Icon name="home" /> },
  { view: 'missions', label: 'Missions', icon: <Icon name="target" /> },
  { view: 'session', label: 'Session', icon: <Icon name="play" /> },
  { view: 'roadmap', label: 'Roadmap', icon: <Icon name="map" /> },
  { view: 'assistant', label: 'AI', icon: <Icon name="brain" /> },
];

function DesktopNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  return <nav className="hidden space-y-2 lg:block">{navItems.map((item) => <button key={item.view} onClick={() => setView(item.view)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${view === item.view ? 'bg-cyan-300 text-slate-950' : 'bg-slate-900/60 text-slate-300 hover:bg-cyan-300/10 light:bg-white/80 light:text-slate-700'}`}>{item.icon}{item.label}</button>)}</nav>;
}

function BottomNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  return <nav className="fixed bottom-3 left-3 right-3 z-20 grid grid-cols-5 rounded-[1.7rem] border border-cyan-300/15 bg-slate-950/90 p-2 shadow-2xl shadow-cyan-950/50 backdrop-blur lg:hidden light:bg-white/90">{navItems.map((item) => <button key={item.view} onClick={() => setView(item.view)} className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] ${view === item.view ? 'bg-cyan-300 text-slate-950' : 'text-slate-400'}`}>{item.icon}{item.label}</button>)}</nav>;
}

function Action({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 px-4 py-3 font-bold hover:bg-cyan-300/10"><Icon name="timer" />{label}</button>;
}

export function App() {
  return <AppShell />;
}
