import { ARROW_COLORS, ARROW_LABELS } from '../lib/analysis/arrowStyles';
import type { SuggestionDisplay } from '../hooks/useEngineAnalysis';

type ArrowLegendProps = {
  suggestions: SuggestionDisplay[];
  isLoading: boolean;
};

/**
 * Compact legend mapping arrow colors to suggested moves at the user's skill level.
 */
export function ArrowLegend({ suggestions, isLoading }: ArrowLegendProps) {
  if (isLoading) {
    return (
      <section className="arrow-legend">
        <p className="arrow-legend__status">Finding moves for your level…</p>
      </section>
    );
  }

  if (suggestions.length === 0) {
    return (
      <section className="arrow-legend">
        <p className="arrow-legend__status">No suggestions yet.</p>
      </section>
    );
  }

  return (
    <section className="arrow-legend" aria-label="Move suggestions">
      <h2 className="arrow-legend__title">Suggested moves</h2>
      <ul className="arrow-legend__list">
        {suggestions.map((item, index) => (
          <li key={`${item.moveSan}-${item.rank}`} className="arrow-legend__item">
            <span
              className="arrow-legend__swatch"
              style={{ backgroundColor: ARROW_COLORS[index] }}
              aria-hidden="true"
            />
            <span className="arrow-legend__label">
              {ARROW_LABELS[index] ?? `${item.rank}th`}
            </span>
            <span className="arrow-legend__move">{item.moveSan}</span>
            <span className="arrow-legend__score">{item.scoreLabel}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
