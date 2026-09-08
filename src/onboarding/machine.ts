export type OnboardingStep =
  | 'signal_detection'
  | 'host_identification'
  | 'binding_sequence'
  | 'contract_sequence'
  | 'arc_initialization'
  | 'activation'
  | 'complete';

export function advanceOnboarding(current: { step: OnboardingStep; completedAt?: number }) {
  const order: OnboardingStep[] = [
    'signal_detection',
    'host_identification',
    'binding_sequence',
    'contract_sequence',
    'arc_initialization',
    'activation',
    'complete',
  ];
  const idx = Math.max(0, order.indexOf(current.step));
  const next = order[Math.min(order.length - 1, idx + 1)];
  return next === 'complete' ? { step: 'complete', completedAt: Date.now() } : { step: next };
}
