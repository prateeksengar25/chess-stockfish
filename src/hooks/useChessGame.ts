import { useCallback, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { tryMove } from '../lib/chess/moveUtils';

/**
 * Manages interactive chess game state for manual move entry on the board.
 */
export function useChessGame() {
  const [game, setGame] = useState(() => new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(
    'white',
  );

  const fen = game.fen();
  const sideToMove = game.turn();

  const resetGame = useCallback(() => {
    setGame(new Chess());
  }, []);

  const undoMove = useCallback(() => {
    setGame((current) => {
      const next = new Chess(current.fen());
      next.undo();
      return next;
    });
  }, []);

  const flipBoard = useCallback(() => {
    setBoardOrientation((current) =>
      current === 'white' ? 'black' : 'white',
    );
  }, []);

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }) => {
      if (!targetSquare) {
        return false;
      }

      const next = new Chess(game.fen());
      if (!tryMove(next, sourceSquare, targetSquare)) {
        return false;
      }

      setGame(next);
      return true;
    },
    [game],
  );

  const canUndo = useMemo(() => game.history().length > 0, [game]);

  return {
    fen,
    sideToMove,
    boardOrientation,
    onPieceDrop,
    resetGame,
    undoMove,
    flipBoard,
    canUndo,
  };
}
