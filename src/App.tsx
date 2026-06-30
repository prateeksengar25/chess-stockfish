import { useState } from 'react';
import { ArrowLegend } from './components/ArrowLegend';
import { ChessBoardPanel } from './components/ChessBoardPanel';
import { Controls } from './components/Controls';
import { EvalBar } from './components/EvalBar';
import { SkillSelector } from './components/SkillSelector';
import { useChessGame } from './hooks/useChessGame';
import { useEngineAnalysis } from './hooks/useEngineAnalysis';
import {
  loadSkillPresetId,
  saveSkillPresetId,
  type SkillPresetId,
} from './lib/analysis/skillPresets';
import './App.css';

/**
 * Root application shell for live chess analysis.
 */
function App() {
  const [skillPresetId, setSkillPresetId] =
    useState<SkillPresetId>(loadSkillPresetId);

  const {
    fen,
    sideToMove,
    boardOrientation,
    onPieceDrop,
    resetGame,
    undoMove,
    flipBoard,
    canUndo,
    undoStepsRemaining,
  } = useChessGame();

  const {
    status,
    whiteCp,
    evalLabel,
    suggestionDisplay,
    arrows,
    errorMessage,
  } = useEngineAnalysis(fen, skillPresetId);

  const handleSkillChange = (presetId: SkillPresetId) => {
    setSkillPresetId(presetId);
    saveSkillPresetId(presetId);
  };

  const isLoading = status === 'loading';

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">Chess Live Analyzer</h1>
          <p className="app__subtitle">
            Move manually — arrows show level-appropriate ideas
          </p>
        </div>
        <SkillSelector value={skillPresetId} onChange={handleSkillChange} />
      </header>

      <main className="app__main">
        <EvalBar
          whiteCp={whiteCp}
          evalLabel={evalLabel}
          sideToMove={sideToMove}
          isLoading={isLoading}
        />

        <Controls
          canUndo={canUndo}
          undoStepsRemaining={undoStepsRemaining}
          onUndo={undoMove}
          onReset={resetGame}
          onFlip={flipBoard}
        />

        <ChessBoardPanel
          fen={fen}
          boardOrientation={boardOrientation}
          arrows={arrows}
          onPieceDrop={onPieceDrop}
        />

        {errorMessage ? (
          <p className="app__error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <ArrowLegend suggestions={suggestionDisplay} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default App;
