import { useCallback, useReducer, useState } from 'react';
import { Chess } from 'chess.js';
import { tryMove } from '../lib/chess/moveUtils';

const INITIAL_FEN = new Chess().fen();

/** Max positions kept (start position + up to 40 moves). */
const MAX_POSITIONS = 41;

type GameState = {
  positions: string[];
  index: number;
};

type GameAction =
  | { type: 'move'; fen: string }
  | { type: 'undo' }
  | { type: 'reset' };

/**
 * Updates the FEN stack used for multi-step undo.
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'move': {
      const truncated = state.positions.slice(0, state.index + 1);
      let positions = [...truncated, action.fen];
      let index = positions.length - 1;

      if (positions.length > MAX_POSITIONS) {
        const overflow = positions.length - MAX_POSITIONS;
        positions = positions.slice(overflow);
        index = positions.length - 1;
      }

      return { positions, index };
    }
    case 'undo':
      return { ...state, index: Math.max(0, state.index - 1) };
    case 'reset':
      return { positions: [INITIAL_FEN], index: 0 };
    default:
      return state;
  }
}

/**
 * Manages interactive chess game state with a fixed-length undo stack.
 */
export function useChessGame() {
  const [state, dispatch] = useReducer(gameReducer, {
    positions: [INITIAL_FEN],
    index: 0,
  });

  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(
    'white',
  );

  const fen = state.positions[state.index] ?? INITIAL_FEN;
  const sideToMove: 'w' | 'b' = fen.split(' ')[1] === 'b' ? 'b' : 'w';
  const undoStepsRemaining = state.index;

  const resetGame = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  const undoMove = useCallback(() => {
    dispatch({ type: 'undo' });
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

      const game = new Chess(fen);
      if (!tryMove(game, sourceSquare, targetSquare)) {
        return false;
      }

      dispatch({ type: 'move', fen: game.fen() });
      return true;
    },
    [fen],
  );

  return {
    fen,
    sideToMove,
    boardOrientation,
    onPieceDrop,
    resetGame,
    undoMove,
    flipBoard,
    canUndo: undoStepsRemaining > 0,
    undoStepsRemaining,
  };
}
