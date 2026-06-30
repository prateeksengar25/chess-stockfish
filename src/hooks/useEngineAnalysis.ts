import { useEffect, useMemo, useState } from 'react';
import { ARROW_COLORS, uciToArrow } from '../lib/analysis/arrowStyles';
import {
  getSkillPreset,
  type SkillPresetId,
} from '../lib/analysis/skillPresets';
import { buildMoveHint, type MoveHint } from '../lib/analysis/moveHints';
import { uciToSan } from '../lib/chess/moveUtils';
import { stockfishManager } from '../lib/engine/stockfishManager';
import type { EngineLine } from '../lib/engine/types';
import {
  formatScore,
  scoreToWhiteCp,
} from '../lib/engine/uciParser';

const EVAL_DEPTH = 16;
const SUGGEST_DEPTH = 14;
const SUGGEST_MULTI_PV = 5;
const ANALYSIS_DEBOUNCE_MS = 180;

export type AnalysisStatus = 'idle' | 'loading' | 'ready' | 'error';

export type SuggestionDisplay = {
  rank: number;
  moveSan: string;
  scoreLabel: string;
  arrow: ReturnType<typeof uciToArrow>;
  hint: MoveHint;
};

/**
 * Runs debounced Stockfish analysis for eval bar and leveled move suggestions.
 */
export function useEngineAnalysis(fen: string, skillPresetId: SkillPresetId) {
  const [status, setStatus] = useState<AnalysisStatus>('loading');
  const [whiteCp, setWhiteCp] = useState(0);
  const [evalLabel, setEvalLabel] = useState('0.0');
  const [suggestions, setSuggestions] = useState<EngineLine[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const skillPreset = useMemo(
    () => getSkillPreset(skillPresetId),
    [skillPresetId],
  );

  useEffect(() => {
    let cancelled = false;
    let requestId = 0;

    const timer = window.setTimeout(async () => {
      const currentRequest = ++requestId;
      setStatus('loading');
      setErrorMessage(null);

      try {
        await stockfishManager.init();

        const sideToMove = fen.split(' ')[1] === 'b' ? 'b' : 'w';

        const evalResult = await stockfishManager.analyze({
          fen,
          depth: EVAL_DEPTH,
          multiPv: 1,
          limitStrength: false,
        });

        if (cancelled || currentRequest !== requestId) {
          return;
        }

        const topEvalLine = evalResult.lines[0];
        if (topEvalLine) {
          setWhiteCp(scoreToWhiteCp(topEvalLine.score, sideToMove));
          setEvalLabel(formatScore(topEvalLine.score, sideToMove));
        }

        const suggestResult = await stockfishManager.analyze({
          fen,
          depth: SUGGEST_DEPTH,
          multiPv: SUGGEST_MULTI_PV,
          limitStrength: skillPreset.limitStrength,
          elo: skillPreset.elo,
        });

        if (cancelled || currentRequest !== requestId) {
          return;
        }

        setSuggestions(suggestResult.lines.slice(0, SUGGEST_MULTI_PV));
        setStatus('ready');
      } catch (error) {
        if (cancelled || currentRequest !== requestId) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Analysis failed';

        if (message === 'Analysis stopped') {
          return;
        }

        setStatus('error');
        setErrorMessage(message);
      }
    }, ANALYSIS_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stockfishManager.stop();
    };
  }, [fen, skillPreset]);

  const suggestionDisplay = useMemo<SuggestionDisplay[]>(() => {
    const sideToMove = fen.split(' ')[1] === 'b' ? 'b' : 'w';
    const bestScore = suggestions[0]?.score;

    return suggestions.map((line, index) => ({
      rank: index + 1,
      moveSan: uciToSan(fen, line.moveUci),
      scoreLabel: formatScore(line.score, sideToMove),
      arrow: uciToArrow(line.moveUci, ARROW_COLORS[index] ?? ARROW_COLORS[4]),
      hint: bestScore
        ? buildMoveHint(fen, line, index + 1, bestScore)
        : {
            comparison: 'Suggested line.',
            themes: [],
            miniPv: '',
          },
    }));
  }, [fen, suggestions]);

  const arrows = useMemo(
    () =>
      suggestionDisplay
        .map((item) => item.arrow)
        .filter((arrow): arrow is NonNullable<typeof arrow> => arrow !== null),
    [suggestionDisplay],
  );

  return {
    status,
    whiteCp,
    evalLabel,
    suggestionDisplay,
    arrows,
    errorMessage,
  };
}
