// Single-active-session control using Firestore document  sessions/{uid}.
// Idea: each sign-in has a unique "auth_time" inside the Firebase ID token. The NEWEST sign-in
// is stored in Firestore. An older sign-in (another device) notices and signs itself out.
// Limit: this is enforced by the app + rules, not by Firebase revoking tokens (that needs the Admin SDK).
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export async function claimSession(user) {
  const token = await user.getIdTokenResult();          // the user's ID token (a signed JWT)
  const mine = Date.parse(token.authTime);              // when THIS sign-in happened
  const ref = doc(db, 'sessions', user.uid);
  const snap = await getDoc(ref);
  const newest = snap.exists() ? snap.data().authTime : 0;
  if (newest > mine) return { superseded: true, mine }; // a newer sign-in exists elsewhere
  if (newest < mine) {
    await setDoc(ref, { authTime: mine, device: (navigator.userAgent || 'unknown').slice(0, 100), updatedAt: serverTimestamp() });
  }
  return { superseded: false, mine };                   // equal = another tab of the same sign-in
}

// Calls onSuperseded() when a newer sign-in appears. Returns an unsubscribe function.
export function watchSession(uid, mine, onSuperseded) {
  return onSnapshot(doc(db, 'sessions', uid),
    (snap) => { if (snap.exists() && snap.data().authTime > mine) onSuperseded(); },
    () => { /* ignore listener errors */ });
}
