import { Priority, LocationOption, CategoryOption } from './types';

export interface PrioritySuggestionResult {
  suggestedPriority: Priority;
  rationale: string;
}

/**
 * Simple, transparent priority rule engine for hotel operations
 */
export function suggestSimplePriority(params: {
  location: LocationOption;
  roomNumber?: string;
  category: CategoryOption;
  title: string;
  description: string;
  guestAffected: boolean;
}): PrioritySuggestionResult {
  const text = `${params.title} ${params.description}`.toLowerCase();

  // 1. P1 EMERGENCY Check
  const isP1 =
    text.includes('fire') ||
    text.includes('smoke') ||
    text.includes('gas') ||
    text.includes('spark') ||
    text.includes('major flood') ||
    text.includes('major leak') ||
    text.includes('flood') ||
    text.includes('trap') ||
    text.includes('entrap') ||
    text.includes('lift stuck') ||
    text.includes('power outage') ||
    text.includes('blackout') ||
    text.includes('safety') ||
    text.includes('shock') ||
    (params.guestAffected && (text.includes('overflow') || text.includes('dripping constantly')));

  if (isP1) {
    return {
      suggestedPriority: 'P1',
      rationale: 'Safety hazard, major leak, gas, electrical or urgent guestroom flooding issue.',
    };
  }

  // 2. P2 HIGH Check
  const isP2 =
    params.guestAffected ||
    params.category === 'AC' ||
    params.category === 'Water' ||
    text.includes('hot water') ||
    text.includes('not cooling') ||
    text.includes('no water') ||
    text.includes('freezer') ||
    text.includes('chiller') ||
    text.includes('cold room') ||
    text.includes('lock') ||
    (params.location === 'Kitchen' && params.category === 'Equipment');

  if (isP2) {
    return {
      suggestedPriority: 'P2',
      rationale: 'Guest comfort impact (AC / Hot Water) or essential kitchen operational equipment.',
    };
  }

  // 3. P4 PLANNED Check
  const isP4 =
    text.includes('paint') ||
    text.includes('planned') ||
    text.includes('schedule') ||
    text.includes('renovation') ||
    text.includes('touch up');

  if (isP4) {
    return {
      suggestedPriority: 'P4',
      rationale: 'Planned cosmetic or scheduled improvement work.',
    };
  }

  // 4. Default: P3 NORMAL
  return {
    suggestedPriority: 'P3',
    rationale: 'Standard operational maintenance request.',
  };
}
