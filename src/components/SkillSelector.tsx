import {
  SKILL_PRESETS,
  type SkillPresetId,
} from '../lib/analysis/skillPresets';

type SkillSelectorProps = {
  value: SkillPresetId;
  onChange: (presetId: SkillPresetId) => void;
};

/**
 * Lets the user choose the skill level used for move suggestions.
 */
export function SkillSelector({ value, onChange }: SkillSelectorProps) {
  return (
    <label className="skill-selector">
      <span className="skill-selector__label">Suggestion level</span>
      <select
        className="skill-selector__select"
        value={value}
        onChange={(event) => onChange(event.target.value as SkillPresetId)}
      >
        {SKILL_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
            {preset.id === 'beginner'
              ? ' (learning)'
              : preset.limitStrength
                ? ` (~${preset.elo})`
                : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
