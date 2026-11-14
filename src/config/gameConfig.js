// All game numbers live here so they are easy to explain and change.
// AI-assisted code (Claude) - see README "Academic integrity".

export const MAX_LEVEL_SCORE = 1000;   // must match firestore.rules
export const FINAL_LEVEL_ID = 3;   // levels 1 and 2, then the final level 3

export const SCORING = {
  timeBonusPerSecond: 2,   // seconds left x 2 ...
  timeBonusCap: 250,       // ... up to this many points
  lifeBonus: 50,           // per life left at the end
};

export const AVATARS = ['🍌', '🍎', '🍊', '🍇', '🍓', '🍍', '🥝', '🍉'];

export const ACHIEVEMENTS = {
  first_win: { icon: '🏅', name: 'First Victory' },
  banana_master: { icon: '🍌', name: 'Banana Master (Level 1)' },
  orange_navigator: { icon: '🍊', name: 'Orange Navigator (Level 2)' },
  treasure_hunter: { icon: '🍎', name: 'Apple Forest Champion (Final)' },
  no_hint_hero: { icon: '🧠', name: 'No-Hint Hero' },
  speedster: { icon: '⚡', name: 'Speedster (won with half the time left)' },
};
export const LEVEL_BADGE = { 1: 'banana_master', 2: 'orange_navigator', 3: 'treasure_hunter' };

// maxHints   = hints available PER ATTEMPT (a restart gives a fresh attempt).
// hintPuzzles = how many Banana API puzzles must be solved to earn ONE hint.
export const LEVELS = {
  1: {
    id: 1, name: 'Banana Jungle', emoji: '🍌', theme: 'jungle', seconds: 90, lives: 2, maxHints: 2, hintPuzzles: 1,
    description: 'Spot the odd fruit out in the jungle.',
    rules: ['A grid of look-alike fruits appears. Tap the ONE that is different.', 'Find 6 odd fruits. Each is worth 100 points.', 'A wrong tap costs 1 life (2 lives).', 'Timer: 1:30. If it hits zero the attempt is over.'],
    hintText: 'Three wrong fruits were faded out - the odd one is still there!',
    stages: [{ game: 'oddone', goal: 6, points: 100 }],
  },
  2: {
    id: 2, name: 'Orange River', emoji: '🍊', theme: 'river', seconds: 90, lives: 2, maxHints: 2, hintPuzzles: 2,
    description: 'Crack tricky fruit patterns before time runs out.',
    rules: ['Find the fruit that continues the pattern (5 choices, harder patterns).', 'Solve 4 patterns, 120 points each.', 'A wrong choice costs 1 life (2 lives).', 'Timer: 1:30.'],
    hintText: 'Pattern hint: read the rule under the fruits, or look for the crossed-out choice.',
    stages: [{ game: 'sequence', goal: 4, points: 120, choices: 5, maxPeriod: 5, hard: true }],
  },
  3: {
    id: 3, name: 'Apple Forest (Final Level)', emoji: '🍎', theme: 'forest', seconds: 60, lives: 8, maxHints: 2, hintPuzzles: 3,
    description: 'The final test: match all 8 pairs among 16 cards.',
    rules: ['Flip two cards at a time and find all 8 matching pairs (16 cards).', 'Each match = 80 points.', 'A wrong pair costs 1 life (8 lives).', 'Timer: 1:00. A hint shows every card for 4 seconds.'],
    hintText: 'All 16 cards are face-up for 4 seconds - memorise them now!',
    stages: [{ game: 'memory', pairs: 8, points: 80, loseLife: true, revealSeconds: 4 }],
  },
};
