export type BoardArrow = {
  startSquare: string;
  endSquare: string;
  color: string;
};

/** Colors for the top five suggested moves, strongest first. */
export const ARROW_COLORS = [
  'rgba(34, 197, 94, 0.92)',
  'rgba(59, 130, 246, 0.88)',
  'rgba(234, 179, 8, 0.86)',
  'rgba(249, 115, 22, 0.84)',
  'rgba(148, 163, 184, 0.82)',
];

export const ARROW_LABELS = ['Best', '2nd', '3rd', '4th', '5th'];

/**
 * Converts a UCI move such as `e2e4` into board arrow coordinates.
 */
export function uciToArrow(moveUci: string, color: string): BoardArrow | null {
  if (moveUci.length < 4) {
    return null;
  }

  return {
    startSquare: moveUci.slice(0, 2),
    endSquare: moveUci.slice(2, 4),
    color,
  };
}
