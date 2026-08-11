/**
 * Goals + tile weights — the math of the equation, with NO AI key at runtime.
 *
 *   y = the Mentor (the overseer, where the math lives)
 *   x = each input tile · w = that tile's share of the ACTIVE goal
 *
 * Each goal carries its own weights (sum ≈ 100): "famous YouTuber" leans on
 * Brand; "185 lb lean" leans on Train/Fuel. The row badges show the active
 * goal's weights; the Mentor lists every goal with its full breakdown.
 *
 * WHO DOES THE MATH: Claude Code, at build time — not an Anthropic key, not
 * you by hand. In VS Code, say:
 *
 *   "My goals are X and Y. Open lib/tiles/weights.ts and re-run the math:
 *    for each goal, weigh how much each tile's input actually moves it
 *    (ask me questions if you need to). Each goal's weights sum to 100."
 *
 * Claude reasons, edits DEFAULT_GOALS, you reload. Later it can also
 * cross-reference your real tile data (video published vs workouts, water,
 * caffeine) and retune from evidence. A localStorage override
 * ('vitality:goals') wins over these defaults, so the connector or a goals
 * UI can retune without a code change.
 */

export interface Goal {
  id: string
  title: string
  /** tile slot -> % of this goal (sums to ~100) */
  weights: Record<string, number>
  /** true while the mentor (Claude Code) hasn't shaped + weighed it yet */
  pending?: boolean
  /** each goal tints the board a little; the overall goal goes gold */
  accent?: string
  /** how far you've come, 0–100 — computed by the mentor from data sweeps
   *  (analytics, manual logs, wearables), never guessed by the app */
  progress?: number
}

/** One observation the mentor pushed after scanning your data, with any
 *  weight changes it made because of what it found. */
export interface Notice {
  id: string
  when: string
  text: string
  /** bullet points; **bold** marks the highlighted words */
  points?: string[]
  deltas?: { tile: string; from: number; to: number }[]
}

export const DEFAULT_GOALS: Goal[] = [
  {
    id: 'dreambody',
    title: 'Dream body by summer',
    accent: '#E8C878',
    // The MAIN goal. Bulk through November, cut in December, dream body by
    // January — see lib/tiles/profile.ts for the phase plan + calorie targets.
    weights: { train: 40, fuel: 30, vitals: 20, peak: 10 },
    progress: 0,
  },
  {
    id: 'ventures',
    title: 'Build La Hora de las Compras & Zenex into real ventures',
    accent: '#8AB4FF',
    weights: { finance: 55, brand: 25, vitals: 10, train: 10 },
    progress: 0,
  },
  {
    id: 'brand',
    title: 'Build my personal brand',
    accent: '#6EE7B7',
    weights: { brand: 70, finance: 15, vitals: 15 },
    progress: 0,
  },
  {
    id: 'impact',
    title: 'Help people and build solutions that reach millions',
    accent: '#C9A6FF',
    weights: { brand: 40, finance: 30, vitals: 15, train: 15 },
    progress: 0,
  },
]

/** The overseer's synthesis, polished from Mati's MAIN goal ("dream body by
 *  summer") into one sharp sentence. Switching it on = top priority — the
 *  board goes gold. Weighted mostly to the body (the goal itself), with a
 *  slice held for brand/finance since the ventures + brand still feed the
 *  same engine — the body that runs them. */
export const OVERALL_GOAL: Goal = {
  id: 'overall',
  title: 'A lean, strong body by summer — built in phases, bulk to cut to peak',
  accent: '#E8C878',
  weights: { train: 35, fuel: 25, vitals: 15, peak: 10, finance: 8, brand: 7 },
  progress: 0,
}

/** Overall first, then the individual goals. */
export function allGoals(): Goal[] {
  return [OVERALL_GOAL, ...goals()]
}

/** The full active Goal (incl. overall), for accent + title. */
export function activeGoal(): Goal | undefined {
  const id = activeGoalId()
  return allGoals().find((g) => g.id === id) ?? goals()[0]
}

export const DEFAULT_NOTICED: Notice[] = [
  {
    id: 'n-setup',
    when: 'today',
    text: 'Set the equation for the first time. **Dream body by summer** is the gold goal — Train and Fuel carry it, with Vitals and Peak backing it up. Ventures, Brand, and Impact still count, weighted underneath. No data yet to notice a pattern in — that comes once you start logging. I\'ll watch for it.',
    points: [
      '**Dream body by summer** set as the gold overall goal',
      'Train + Fuel carry the most weight — Vitals and Peak back them up',
      '**Ventures, Brand, and Impact** stay live underneath, not forgotten',
      'No data logged yet — I\'ll retune the weights once there\'s a pattern to see',
    ],
  },
]

/** A blueprint for a tile they SHOULD have — a gap the mentor found between
 *  their goal and what their tiles actually track. Pre-written by the mentor
 *  (Claude Code) from their data; localStorage 'vitality:ideas' overrides. */
export interface TileIdea {
  /** ONE word — how the idea shows up in the popup (the mentor picks it) */
  word?: string
  title: string
  /** what the tile tracks, in one line */
  tracks: string
  /** why it moves THIS goal — tied to their data when possible */
  why: string
  /** the weight it would likely earn (≈ %) */
  estWeight: number
}

export const DEFAULT_IDEAS: Record<string, TileIdea[]> = {
  overall: [
    {
      word: 'Weight',
      title: 'Bodyweight trend',
      tracks: 'weekly weigh-ins across bulk → cut → dream body',
      why: 'Three phases, three targets — nothing currently shows you the line from 78kg now to summer. This would.',
      estWeight: 10,
    },
    {
      word: 'Sleep',
      title: 'Sleep consistency',
      tracks: 'bedtime variance, night by night',
      why: 'Recovery drives both the gym and the businesses. Vitals sees the score; this would see the habit behind it.',
      estWeight: 6,
    },
  ],
  dreambody: [
    {
      word: 'Macros',
      title: 'Macro tracking',
      tracks: 'protein/carbs/fat vs your phase target',
      why: 'Fuel currently only tracks water. Your bulk/cut plan lives in your profile — a macro tile would hold you to it day by day.',
      estWeight: 15,
    },
    {
      word: 'Lifts',
      title: 'Lift progression',
      tracks: 'top set weight per lift, week over week',
      why: 'Train shows you went — this would show you got stronger, which is the actual signal for "dream body."',
      estWeight: 10,
    },
  ],
  ventures: [
    {
      word: 'Runway',
      title: 'Runway / revenue tracker',
      tracks: 'La Hora de las Compras + Zenex revenue and burn, side by side',
      why: 'Two businesses, one Finance tile — right now it can\'t tell them apart. This splits the signal.',
      estWeight: 15,
    },
    {
      word: 'Focus',
      title: 'Deep-work hours',
      tracks: 'hours spent building, per venture, per week',
      why: 'Ventures move on hours invested before they move on revenue. This is the leading indicator.',
      estWeight: 10,
    },
  ],
  brand: [
    {
      word: 'Pipeline',
      title: 'Content pipeline',
      tracks: 'ideas → filmed → edited → published',
      why: 'Brand tracks the channel; this tracks the machine that feeds it. Publishing cadence is the single biggest lever here.',
      estWeight: 12,
    },
  ],
  impact: [
    {
      word: 'Reach',
      title: 'People reached',
      tracks: 'users helped / community touched, cumulative',
      why: '"Millions of people" is the goal — nothing counts toward it yet. Even a rough number beats no number.',
      estWeight: 12,
    },
  ],
}

/** The mentor's tile recommendations for a goal (localStorage override wins). */
export function tileIdeas(goalId: string): TileIdea[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('vitality:ideas')
      if (raw) {
        const o = JSON.parse(raw)
        if (o && typeof o === 'object' && Array.isArray(o[goalId])) return o[goalId] as TileIdea[]
      }
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_IDEAS[goalId] ?? DEFAULT_IDEAS.overall ?? []
}

/** The mentor's noticed feed: localStorage override, else the seeded example.
 *  Claude Code (or the connector) writes 'vitality:noticed' after a scan. */
export function noticedFeed(): Notice[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('vitality:noticed')
      if (raw) {
        const o = JSON.parse(raw)
        if (Array.isArray(o)) return o as Notice[]
      }
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_NOTICED
}

/** Save the goals list (used by the mentor page's goal input). */
export function saveGoals(list: Goal[]): void {
  try {
    window.localStorage.setItem('vitality:goals', JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

/** All goals: localStorage override ('vitality:goals') if valid, else defaults. */
export function goals(): Goal[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('vitality:goals')
      if (raw) {
        const o = JSON.parse(raw)
        if (Array.isArray(o) && o.every((g) => g && typeof g.id === 'string' && g.weights)) return o as Goal[]
      }
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_GOALS
}

/** The active goal id (persisted). Defaults to the first goal. */
export function activeGoalId(): string {
  if (typeof window !== 'undefined') {
    try {
      const v = window.localStorage.getItem('vitality:goal:active')
      if (v) return v
    } catch {
      /* fall through */
    }
  }
  return goals()[0]?.id ?? ''
}

export function setActiveGoalId(id: string): void {
  try {
    window.localStorage.setItem('vitality:goal:active', id)
  } catch {
    /* ignore */
  }
}

/** The active goal's weights (the badges on the row read these). */
export function tileWeights(): Record<string, number> {
  return activeGoal()?.weights ?? {}
}
