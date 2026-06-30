import type { EngineLine, EngineScore } from './types';

/**
 * Parses a UCI `info` line into structured engine data.
 * Returns null when the line is not a usable info line.
 */
export function parseInfoLine(line: string): {
  multiPv: number;
  depth: number;
  score: EngineScore;
  pv: string[];
} | null {
  if (!line.startsWith('info ')) {
    return null;
  }

  if (!line.includes(' pv ')) {
    return null;
  }

  const depthMatch = line.match(/\bdepth (\d+)/);
  const multiPvMatch = line.match(/\bmultipv (\d+)/);
  const cpMatch = line.match(/\bscore cp (-?\d+)/);
  const mateMatch = line.match(/\bscore mate (-?\d+)/);
  const pvMatch = line.match(/\bpv (.+)$/);

  if (!depthMatch || !pvMatch) {
    return null;
  }

  let score: EngineScore;
  if (mateMatch) {
    score = { type: 'mate', value: Number(mateMatch[1]) };
  } else if (cpMatch) {
    score = { type: 'cp', value: Number(cpMatch[1]) };
  } else {
    return null;
  }

  const pv = pvMatch[1].trim().split(/\s+/);
  if (pv.length === 0) {
    return null;
  }

  return {
    multiPv: multiPvMatch ? Number(multiPvMatch[1]) : 1,
    depth: Number(depthMatch[1]),
    score,
    pv,
  };
}

/**
 * Converts an engine score to a display string from White's perspective.
 */
export function formatScore(
  score: EngineScore,
  sideToMove: 'w' | 'b',
): string {
  const sign = (value: number) => (value > 0 ? `+${value}` : `${value}`);

  if (score.type === 'mate') {
    const mateForWhite =
      sideToMove === 'w' ? score.value : -score.value;
    return mateForWhite > 0 ? `M${mateForWhite}` : `-M${Math.abs(mateForWhite)}`;
  }

  const cpForWhite = sideToMove === 'w' ? score.value : -score.value;
  const pawns = cpForWhite / 100;
  return sign(Number(pawns.toFixed(1)));
}

/**
 * Converts an engine score to centipawns from White's perspective for the eval bar.
 */
export function scoreToWhiteCp(
  score: EngineScore,
  sideToMove: 'w' | 'b',
): number {
  if (score.type === 'mate') {
    const mateForWhite = sideToMove === 'w' ? score.value : -score.value;
    const magnitude = 10000 - Math.abs(mateForWhite) * 100;
    return mateForWhite > 0 ? magnitude : -magnitude;
  }

  return sideToMove === 'w' ? score.value : -score.value;
}

/**
 * Builds engine lines from accumulated info rows, keeping the deepest entry per MultiPV slot.
 */
export function buildEngineLines(
  infoByMultiPv: Map<number, { depth: number; score: EngineScore; pv: string[] }>,
): EngineLine[] {
  return [...infoByMultiPv.entries()]
    .sort(([a], [b]) => a - b)
    .map(([multiPv, entry]) => ({
      multiPv,
      depth: entry.depth,
      score: entry.score,
      pv: entry.pv,
      moveUci: entry.pv[0] ?? '',
    }));
}
