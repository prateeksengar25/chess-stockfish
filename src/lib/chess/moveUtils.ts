import { Chess } from 'chess.js';

/**
 * Applies a UCI move to a game instance, defaulting pawn promotions to queen.
 */
export function applyUciMove(game: Chess, moveUci: string) {
  if (!moveUci || moveUci.length < 4) {
    return null;
  }

  try {
    return game.move({
      from: moveUci.slice(0, 2),
      to: moveUci.slice(2, 4),
      promotion:
        moveUci.length > 4 ? (moveUci[4] as 'q' | 'r' | 'b' | 'n') : undefined,
    });
  } catch {
    return null;
  }
}

/**
 * Attempts a move on the given game instance, defaulting pawn promotions to queen.
 */
export function tryMove(game: Chess, from: string, to: string): boolean {
  const piece = game.get(from as Parameters<Chess['get']>[0]);
  let promotion: 'q' | undefined;

  if (piece?.type === 'p') {
    const targetRank = to[1];
    if (targetRank === '8' || targetRank === '1') {
      promotion = 'q';
    }
  }

  try {
    const move = game.move({ from, to, promotion });
    return move !== null;
  } catch {
    return false;
  }
}

/**
 * Converts the first UCI move in a PV to SAN notation for display.
 */
export function uciToSan(fen: string, moveUci: string): string {
  if (!moveUci || moveUci.length < 4) {
    return moveUci;
  }

  const temp = new Chess(fen);
  const move = applyUciMove(temp, moveUci);
  return move?.san ?? moveUci;
}
