type EvalBarProps = {
  whiteCp: number;
  evalLabel: string;
  sideToMove: 'w' | 'b';
  isLoading: boolean;
};

/**
 * Shows objective position evaluation as a white-vs-black advantage bar.
 */
export function EvalBar({
  whiteCp,
  evalLabel,
  sideToMove,
  isLoading,
}: EvalBarProps) {
  const clampedCp = Math.max(-800, Math.min(800, whiteCp));
  const whitePercent = 50 + (clampedCp / 800) * 45;
  const turnLabel = sideToMove === 'w' ? 'White to move' : 'Black to move';

  return (
    <section className="eval-bar" aria-label="Position evaluation">
      <div className="eval-bar__header">
        <span className="eval-bar__turn">{turnLabel}</span>
        <span className="eval-bar__score">
          {isLoading ? 'Analyzing…' : evalLabel}
        </span>
      </div>
      <div className="eval-bar__track">
        <div
          className="eval-bar__white"
          style={{ width: `${whitePercent}%` }}
        />
        <div
          className="eval-bar__black"
          style={{ width: `${100 - whitePercent}%` }}
        />
      </div>
      <div className="eval-bar__labels">
        <span>White</span>
        <span>Black</span>
      </div>
    </section>
  );
}
