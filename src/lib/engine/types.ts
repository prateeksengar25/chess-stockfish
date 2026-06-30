/** Centipawn or mate score from the engine's perspective of the side to move. */
export type EngineScore =
  | { type: 'cp'; value: number }
  | { type: 'mate'; value: number };

/** A single principal-variation line from MultiPV analysis. */
export type EngineLine = {
  multiPv: number;
  depth: number;
  score: EngineScore;
  pv: string[];
  moveUci: string;
};

/** Result of a completed engine search for one position. */
export type AnalysisResult = {
  fen: string;
  lines: EngineLine[];
  bestMoveUci: string | null;
};

/** Options passed when requesting analysis from Stockfish. */
export type AnalyzeOptions = {
  fen: string;
  depth: number;
  multiPv?: number;
  limitStrength?: boolean;
  elo?: number;
  skillLevel?: number;
  movetimeMs?: number;
};
