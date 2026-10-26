// All game numbers live here so they are easy to explain and change.
// AI-assisted code (Claude) - see README "Academic integrity".

export const MAX_LEVEL_SCORE = 1000;   // must match firestore.rules
export const FINAL_LEVEL_ID = 5;

export const SCORING = {
  timeBonusPerSecond: 2,   // seconds left x 2 ...
  timeBonusCap: 250,       // ... up to this many points
  lifeBonus: 50,           // per life left at the end
};

export const AVATARS = ['🍌', '🍎', '🍊', '🍇', '🍓', '🍍', '🥝', '🍉'];

export const ACHIEVEMENTS = {
  first_win: { icon: '🏅', name: 'First Victory' },
  banana_master: { icon: '🍌', name: 'Banana Master (Level 1)' },
  apple_collector: { icon: '🍎', name: 'Apple Collector (Level 2)' },
  orange_navigator: { icon: '🍊', name: 'Orange Navigator (Level 3)' },
  golden_fruit: { icon: '🏆', name: 'Golden Fruit (Level 4)' },
  treasure_hunter: { icon: '💎', name: 'Treasure Hunter (Final)' },
  no_hint_hero: { icon: '🧠', name: 'No-Hint Hero' },
  speedster: { icon: '⚡', name: 'Speedster (won with half the time left)' },
};
export const LEVEL_BADGE = { 1: 'banana_master', 2: 'apple_collector', 3: 'orange_navigator', 4: 'golden_fruit', 5: 'treasure_hunter' };

// maxHints = hints available PER ATTEMPT (a restart gives a fresh attempt).
export const LEVELS = {
  1: {
    id: 1, name: 'Banana Jungle', emoji: '🍌', theme: 'jungle', seconds: 180, lives: 3, maxHints: 5,
    description: 'Count the fruits hiding in the jungle. A gentle start!',
    rules: ['Count how many of the named fruit you can see, then tap the right number.', 'Solve 5 rounds. Each is worth 100 points.', 'A wrong answer costs 1 life (3 lives).', 'Timer: 3:00. If it hits zero the attempt is over.'],
    stages: [{ game: 'counting', goal: 5, points: 100, maxCount: 7 }],
  },
  2: {
    id: 2, name: 'Apple Forest', emoji: '🍎', theme: 'forest', seconds: 120, lives: 3, maxHints: 4,
    description: 'Flip cards and match the fruit pairs.',
    rules: ['Flip two cards at a time and find all 6 matching pairs.', 'Each match = 60 points.', 'A wrong pair costs 3 seconds (no life lost).', 'Timer: 2:00.'],
    stages: [{ game: 'memory', pairs: 6, points: 60, penaltySeconds: 3 }],
  },
  3: {
    id: 3, name: 'Orange River', emoji: '🍊', theme: 'river', seconds: 90, lives: 2, maxHints: 2,
    description: 'Spot the pattern and pick the next fruit.',
    rules: ['Find the fruit that continues the pattern (4 choices).', 'Solve 5 patterns, 90 points each.', 'A wrong choice costs 1 life (only 2 lives!).', 'Timer: 1:30.'],
    stages: [{ game: 'sequence', goal: 5, points: 90, choices: 4, maxPeriod: 4 }],
  },
  4: {
    id: 4, name: 'Golden Fruit Temple', emoji: '🏆', theme: 'temple', seconds: 60, lives: 2, maxHints: 1,
    description: 'Sort fruits by tricky rules - fast!',
    rules: ['Tap every fruit that matches the rule, then press Check.', 'Complete 3 rounds, 150 points each. Rules combine colour and size.', 'A wrong check costs 1 life (2 lives).', 'Timer: 1:00. Finish for the golden fruit!'],
    stages: [{ game: 'sorting', goal: 3, points: 150, difficulty: 3 }],
  },
  5: {
    id: 5, name: 'Final Treasure Challenge', emoji: '💎', theme: 'treasure', seconds: 100, lives: 3, maxHints: 3,
    description: 'Counting, patterns and sorting - all in one run.',
    rules: ['Three stages, one shared timer (1:40).', 'Stage 1: 2 counting rounds. Stage 2: 2 patterns. Stage 3: 1 sorting round.', 'Every success = 100 points. A mistake costs 1 life (3 lives).'],
    stages: [
      { game: 'counting', goal: 2, points: 100, maxCount: 10 },
      { game: 'sequence', goal: 2, points: 100, choices: 4, maxPeriod: 3 },
      { game: 'sorting', goal: 1, points: 100, difficulty: 2 },
    ],
  },
};
