export type OnboardingStep =
  | 'signal_detection'
  | 'host_identification'
  | 'binding_sequence'
  | 'contract_sequence'
  | 'arc_initialization'
  | 'activation'
  | 'complete';

const ORDER: OnboardingStep[] = [
  'signal_detection',
  'host_identification',
  'binding_sequence',
  'contract_sequence',
  'arc_initialization',
  'activation',
  'complete',
];

export interface OnboardingState {
  step: OnboardingStep;
  completedAt?: number;
}

export function nextStep(current: OnboardingStep): OnboardingStep {
  const idx = ORDER.indexOf(current);
  return ORDER[Math.min(idx + 1, ORDER.length - 1)];
}

export function advanceOnboarding(state: OnboardingState): OnboardingState {
  const step = nextStep(state.step);
  if (step === 'complete') return { step, completedAt: Date.now() };
  return { ...state, step };
}
