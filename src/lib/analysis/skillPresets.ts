export type SkillPresetId =
  | 'beginner'
  | 'casual'
  | 'intermediate'
  | 'advanced'
  | 'full';

export type SkillPreset = {
  id: SkillPresetId;
  label: string;
  elo: number;
  limitStrength: boolean;
};

/** User-facing skill levels mapped to Stockfish UCI_Elo settings. */
export const SKILL_PRESETS: SkillPreset[] = [
  { id: 'beginner', label: 'Beginner', elo: 1200, limitStrength: true },
  { id: 'casual', label: 'Casual', elo: 1500, limitStrength: true },
  { id: 'intermediate', label: 'Intermediate', elo: 1800, limitStrength: true },
  { id: 'advanced', label: 'Advanced', elo: 2200, limitStrength: true },
  { id: 'full', label: 'Full engine', elo: 0, limitStrength: false },
];

export const DEFAULT_SKILL_PRESET_ID: SkillPresetId = 'beginner';

const STORAGE_KEY = 'chess-analyzer-skill';

/**
 * Loads the saved skill preset id from localStorage.
 */
export function loadSkillPresetId(): SkillPresetId {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (SKILL_PRESETS.some((preset) => preset.id === stored)) {
    return stored as SkillPresetId;
  }
  return DEFAULT_SKILL_PRESET_ID;
}

/**
 * Persists the selected skill preset id to localStorage.
 */
export function saveSkillPresetId(presetId: SkillPresetId): void {
  localStorage.setItem(STORAGE_KEY, presetId);
}

/**
 * Returns the preset config for a given id.
 */
export function getSkillPreset(presetId: SkillPresetId): SkillPreset {
  return (
    SKILL_PRESETS.find((preset) => preset.id === presetId) ??
    SKILL_PRESETS[0]
  );
}
