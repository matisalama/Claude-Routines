/**
 * Your body, on file — the personal inputs the mentor ASKS for.
 *
 * The mentor (Claude Code) interviews you — height, weight, age, units — the
 * first time a goal or tile needs body math (peak pharmacokinetics scale by
 * bodyweight; fuel targets scale by all of it). It writes the answers here,
 * you reload. Never guessed, never required up front: every field is optional
 * and the math degrades gracefully to sensible defaults.
 *
 * Two write paths, same as goals/weights:
 *   · this file (DEFAULT_PROFILE) — the mentor edits it in VS Code
 *   · localStorage 'vitality:profile' — the connector or a UI can retune
 *     without a code change; it wins over the defaults
 *
 * Ask in their units, store metric. lib knows only cm/kg.
 */

export interface Profile {
  /** First name, for the greeting. */
  name?: string
  heightCm?: number
  weightKg?: number
  age?: number
  sex?: 'male' | 'female'
  /** How to TALK to them about it — storage stays metric. */
  units?: 'metric' | 'imperial'
  /** Current phase of a multi-phase body goal — drives which calorie/protein
   *  target below is "active". Set by the mentor from a conversation, e.g.
   *  "bulk until November, cut in December, dream body in January". */
  goalPhase?: 'bulk' | 'cut' | 'lean-bulk' | 'maintain'
  /** kcal/day target for the CURRENT phase (Mifflin-St Jeor maintenance,
   *  then a phase-appropriate surplus/deficit). Recompute if weight/phase change. */
  calorieTargetKcal?: number
  /** protein target in grams for the current phase (~2-2.2 g/kg, higher in a cut). */
  proteinTargetG?: number
  /** Free-text plan so future phases aren't lost — the mentor (or a rebuilt
   *  Fuel tile) reads this to know what's next and when to switch targets. */
  phasePlan?: string
}

/** Blank until the mentor asks. Fallbacks live at the call sites. */
export const DEFAULT_PROFILE: Profile = {
  name: 'Mati',
  age: 24,
  sex: 'male',
  heightCm: 170,
  weightKg: 78,
  units: 'metric',
  goalPhase: 'bulk',
  calorieTargetKcal: 3030,
  proteinTargetG: 155,
  phasePlan:
    'Bulk now through November (~3030 kcal, ~155g protein) → cut in December (~2180 kcal, ~170g protein) → dream body by January (reassess near maintenance, ~2680 kcal). Maintenance estimate: 2680 kcal (Mifflin-St Jeor, 170cm/78kg/24/male).',
}

/** The profile: localStorage override ('vitality:profile') if valid, else defaults. */
export function profile(): Profile {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('vitality:profile')
      if (raw) {
        const o = JSON.parse(raw)
        if (o && typeof o === 'object' && !Array.isArray(o)) return o as Profile
      }
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_PROFILE
}

export function saveProfile(p: Profile): void {
  try {
    window.localStorage.setItem('vitality:profile', JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

/** Bodyweight for tile math (peak PK etc.) — 75 kg until they've been asked. */
export function bodyWeightKg(): number {
  return profile().weightKg ?? 75
}
