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
  /** Stockfish Skill Level 0–20; strongest when UCI_LimitStrength is off. */
  skillLevel: number;
  /** Search depth for move suggestions at this level. */
  suggestDepth: number;
  /** Optional movetime cap (ms) to keep low levels from searching too deep. */
  movetimeMs?: number;
  /** Hide the full-strength best move from suggestions (teaching mode). */
  hideEngineBest: boolean;
};

/** User-facing skill levels mapped to Stockfish weakness settings. */
export const SKILL_PRESETS: SkillPreset[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    elo: 1320,
    limitStrength: true,
    skillLevel: 6,
    suggestDepth: 9,
    movetimeMs: 600,
    hideEngineBest: false,
  },
  {
    id: 'casual',
    label: 'Casual',
    elo: 1500,
    limitStrength: true,
    skillLevel: 10,
    suggestDepth: 10,
    movetimeMs: 700,
    hideEngineBest: false,
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    elo: 1700,
    limitStrength: true,
    skillLevel: 12,
    suggestDepth: 10,
    hideEngineBest: false,
  },
  {
    id: 'advanced',
    label: 'Advanced',
    elo: 2100,
    limitStrength: true,
    skillLevel: 16,
    suggestDepth: 12,
    hideEngineBest: false,
  },
  {
    id: 'full',
    label: 'Full engine',
    elo: 0,
    limitStrength: false,
    skillLevel: 20,
    suggestDepth: 14,
    hideEngineBest: false,
  },
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
