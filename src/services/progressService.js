// Saves finished runs:  users/{uid}/progress/{levelId}, users/{uid}/gameSessions/{id}, leaderboard/{uid}
import { collection, doc, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ACHIEVEMENTS, FINAL_LEVEL_ID, LEVEL_BADGE } from '../config/gameConfig';

export async function loadProgress(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'progress'));
  const out = {};
  snap.forEach((d) => { out[d.id] = d.data(); });
  return out;
}

// SCORE POLICY: total score = sum of your BEST score on each level.
// Replaying or restarting can never add the same points twice (only the improvement counts).
export async function recordRun(uid, run) {
  const { levelId, result, score, hintsUsed, timeLeft, lives, seconds } = run;
  const userRef = doc(db, 'users', uid);
  const progRef = doc(db, 'users', uid, 'progress', String(levelId));
  const sessionRef = doc(collection(db, 'users', uid, 'gameSessions'));
  const lbRef = doc(db, 'leaderboard', uid);

  return runTransaction(db, async (tx) => {
    // All reads first, then writes (Firestore transaction rule).
    const [uSnap, pSnap] = await Promise.all([tx.get(userRef), tx.get(progRef)]);
    if (!uSnap.exists()) throw new Error('Profile not found.');
    const u = uSnap.data();
    if (u.unlockedLevel < levelId) throw new Error('That level is still locked.');

    tx.set(sessionRef, { levelId, result, score, hintsUsed, timeLeft, livesLeft: lives, createdAt: serverTimestamp() });
    const update = { gamesPlayed: u.gamesPlayed + 1, hintsUsed: u.hintsUsed + hintsUsed };
    let delta = 0, newAchievements = [], total = u.totalScore;

    if (result === 'won') {
      const prev = pSnap.exists() ? pSnap.data() : null;
      const prevBest = prev?.bestScore ?? 0;
      const best = Math.max(prevBest, score);
      delta = best - prevBest;
      total = u.totalScore + delta;
      const completed = Array.from(new Set([...u.completedLevels, levelId])).sort();

      const candidates = [LEVEL_BADGE[levelId]];
      if (u.completedLevels.length === 0) candidates.push('first_win');
      if (hintsUsed === 0) candidates.push('no_hint_hero');
      if (timeLeft >= seconds / 2) candidates.push('speedster');
      newAchievements = candidates.filter((a) => ACHIEVEMENTS[a] && !u.achievements.includes(a));

      tx.set(progRef, {
        bestScore: best,
        bestTimeLeft: Math.max(prev?.bestTimeLeft ?? 0, timeLeft),
        timesCompleted: (prev?.timesCompleted ?? 0) + 1,
        hintsUsed: (prev?.hintsUsed ?? 0) + hintsUsed,
        updatedAt: serverTimestamp(),
      });
      Object.assign(update, {
        totalScore: total,
        bestRun: Math.max(u.bestRun, score),
        unlockedLevel: Math.max(u.unlockedLevel, Math.min(FINAL_LEVEL_ID, levelId + 1)),
        completedLevels: completed,
        achievements: [...u.achievements, ...newAchievements],
      });
      tx.set(lbRef, { displayName: u.displayName, avatar: u.avatar, totalScore: total, levelsCompleted: completed.length, updatedAt: serverTimestamp() });
    }
    tx.update(userRef, update);
    return { delta, total, newAchievements };
  });
}
