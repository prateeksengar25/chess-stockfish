import type { EngineLine } from '../engine/types';

const SUGGEST_MULTI_PV = 5;

/**
 * Picks suggestion lines for display, optionally hiding the engine's top move.
 */
export function pickSuggestionLines(
  lines: EngineLine[],
  fullStrengthBestUci: string | null,
  hideEngineBest: boolean,
): EngineLine[] {
  const trimmed = lines.slice(0, SUGGEST_MULTI_PV);

  if (!hideEngineBest || !fullStrengthBestUci) {
    return trimmed;
  }

  const withoutEngineBest = lines.filter(
    (line) => line.moveUci !== fullStrengthBestUci,
  );

  if (withoutEngineBest.length >= 3) {
    return withoutEngineBest.slice(0, SUGGEST_MULTI_PV);
  }

  return trimmed;
}
