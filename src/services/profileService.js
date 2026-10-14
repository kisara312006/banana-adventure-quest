// Reads/writes the private player document:  users/{uid}
import { doc, getDoc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Creates users/{uid} only if it does not exist yet (Authentication does NOT do this for us).
export async function ensureProfile(user, fallbackName) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const profile = {
    displayName: (user.displayName || fallbackName || 'Banana Player').slice(0, 20),
    email: user.email,
    avatar: '🍌',
    createdAt: serverTimestamp(),
    totalScore: 0, bestRun: 0, gamesPlayed: 0, hintsUsed: 0,
    unlockedLevel: 1, completedLevels: [], achievements: [],
  };
  await setDoc(ref, profile);
  return (await getDoc(ref)).data();
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// Only display name + avatar are player-editable. Rules enforce this too.
export async function updateProfileFields(uid, profile, { displayName, avatar }) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', uid), { displayName, avatar });
  if (profile.completedLevels.length > 0) { // leaderboard entry exists -> keep it in sync
    batch.set(doc(db, 'leaderboard', uid), {
      displayName, avatar, totalScore: profile.totalScore,
      levelsCompleted: profile.completedLevels.length, updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}
