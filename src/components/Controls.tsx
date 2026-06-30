type ControlsProps = {
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onFlip: () => void;
};

/**
 * Primary board controls for undo, reset, and orientation flip.
 */
export function Controls({ canUndo, onUndo, onReset, onFlip }: ControlsProps) {
  return (
    <div className="controls">
      <button
        type="button"
        className="controls__button"
        onClick={onUndo}
        disabled={!canUndo}
      >
        Undo
      </button>
      <button type="button" className="controls__button" onClick={onReset}>
        New game
      </button>
      <button type="button" className="controls__button" onClick={onFlip}>
        Flip board
      </button>
    </div>
  );
}
