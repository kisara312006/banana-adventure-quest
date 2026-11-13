// Firebase Authentication helpers (identity only - profile data lives in Firestore).
import {
  GoogleAuthProvider, browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword,
  setPersistence, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

// Name typed on the register form; AuthProvider uses it when it creates the profile document.
export let pendingDisplayName = null;

// "Remember me" = keep the login after the browser closes (local). Otherwise it ends with the tab (session).
const setRemember = (remember) => setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

export async function registerUser(displayName, email, password) {
  pendingDisplayName = displayName;
  await setRemember(true);
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user;
}
export async function loginUser(email, password, remember = true) {
  await setRemember(remember);
  return signInWithEmailAndPassword(auth, email, password);
}
// Opens the Google popup. New players get an account; returning players are signed in.
export async function loginWithGoogle(remember = true) {
  await setRemember(remember);
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  return cred.user;
}
export const logoutUser = () => signOut(auth);

// Reads the current ID token's details (sign-in time, expiry...). forceRefresh=true asks Firebase for a new token.
export async function getTokenInfo(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  const t = await user.getIdTokenResult(forceRefresh);
  return { signedInAt: t.authTime, issuedAt: t.issuedAtTime, expiresAt: t.expirationTime, provider: t.signInProvider };
}

export function friendlyAuthError(err) {
  const map = {
    'auth/email-already-in-use': 'That email is already registered. Try logging in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password is too weak - use at least 6 characters.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/user-not-found': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network problem. Check your internet connection.',
    'auth/popup-closed-by-user': 'The Google window was closed before finishing.',
    'auth/popup-blocked': 'Your browser blocked the Google popup. Allow popups for this site and try again.',
    'permission-denied': 'The database refused this action. Check your Firestore rules are published.',
  };
  console.error('Auth error:', err);
  return map[err?.code] || `Something went wrong (${err?.code || err?.message || 'unknown'}).`;
}
