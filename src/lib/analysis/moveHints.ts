import { Chess, SQUARES, type Square } from 'chess.js';
import type { EngineScore } from '../engine/types';
import { applyUciMove } from '../chess/moveUtils';

const CENTER_FILES = new Set(['c', 'd', 'e', 'f']);
const PIECE_NAMES: Record<string, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

/**
 * Converts an engine score to comparable centipawns from the mover's perspective.
 */
export function scoreToComparableCp(score: EngineScore): number {
  if (score.type === 'mate') {
    return score.value > 0 ? 10_000 - Math.abs(score.value) : -10_000;
  }

  return score.value;
}

/**
 * Builds a short comparison line against the top suggested move.
 */
export function buildComparisonHint(
  rank: number,
  score: EngineScore,
  bestScore: EngineScore,
): string {
  if (rank === 1) {
    return 'Top choice for your level.';
  }

  const gapCp = scoreToComparableCp(bestScore) - scoreToComparableCp(score);
  const gapPawns = gapCp / 100;

  if (gapCp <= 15) {
    return 'Nearly as strong as the top move.';
  }

  if (gapCp <= 50) {
    return `A bit weaker (~${gapPawns.toFixed(1)} pawns) than the best line.`;
  }

  return `Noticeably weaker (~${gapPawns.toFixed(1)} pawns) than the best line.`;
}

/**
 * Detects simple move themes using chess.js after applying the suggested move.
 */
export function detectMoveThemes(fen: string, moveUci: string): string[] {
  const game = new Chess(fen);
  const move = applyUciMove(game, moveUci);
  if (!move) {
    return [];
  }

  const themes: string[] = [];
  const mover = move.color;
  const opponent = mover === 'w' ? 'b' : 'w';

  if (move.isCapture()) {
    const captured = PIECE_NAMES[move.captured ?? 'p'] ?? 'piece';
    themes.push(`Captures the ${captured}`);
  }

  if (move.isPromotion()) {
    themes.push('Promotes for stronger material');
  }

  if (move.isEnPassant()) {
    themes.push('Wins material with en passant');
  }

  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    themes.push('Castles to improve king safety');
  }

  if (game.inCheck()) {
    themes.push('Puts the king in check');
  }

  const fromRank = move.from[1];
  if (
    (move.piece === 'n' || move.piece === 'b') &&
    ((mover === 'w' && fromRank === '1') || (mover === 'b' && fromRank === '8'))
  ) {
    themes.push('Develops a piece');
  }

  if (move.piece === 'p' && CENTER_FILES.has(move.to[0])) {
    themes.push('Fights for central control');
  }

  const queenSquare = findPieceSquare(game, opponent, 'q');
  if (queenSquare && game.isAttacked(queenSquare, mover)) {
    themes.push('Attacks the queen');
  }

  if (themes.length === 0) {
    themes.push('Improves your position');
  }

  return themes.slice(0, 2);
}

/**
 * Formats the first few PV plies as compact SAN notation.
 */
export function formatMiniPv(
  fen: string,
  pvUci: string[],
  maxPlies = 4,
): string {
  const game = new Chess(fen);
  const startTurn = game.turn();
  const fullmove = Number.parseInt(fen.split(' ')[5] ?? '1', 10);
  const parts: string[] = [];
  const limit = Math.min(pvUci.length, maxPlies);

  for (let i = 0; i < limit; i += 1) {
    const move = applyUciMove(game, pvUci[i]);
    if (!move) {
      break;
    }

    if (move.color === 'w') {
      const moveNumber = i === 0 && startTurn === 'w' ? fullmove : game.moveNumber();
      parts.push(`${moveNumber}. ${move.san}`);
      continue;
    }

    if (i === 0 && startTurn === 'b') {
      parts.push(`${fullmove}... ${move.san}`);
    } else {
      parts.push(move.san);
    }
  }

  return parts.join(' ');
}

export type MoveHint = {
  comparison: string;
  themes: string[];
  miniPv: string;
};

/**
 * Builds the full hint package for a suggested move.
 */
export function buildMoveHint(
  fen: string,
  line: {
    moveUci: string;
    score: EngineScore;
    pv: string[];
  },
  rank: number,
  bestScore: EngineScore,
): MoveHint {
  return {
    comparison: buildComparisonHint(rank, line.score, bestScore),
    themes: detectMoveThemes(fen, line.moveUci),
    miniPv: formatMiniPv(fen, line.pv),
  };
}

function findPieceSquare(
  game: Chess,
  color: 'w' | 'b',
  pieceType: string,
): Square | null {
  for (const square of SQUARES) {
    const piece = game.get(square);
    if (piece?.color === color && piece.type === pieceType) {
      return square;
    }
  }

  return null;
}
