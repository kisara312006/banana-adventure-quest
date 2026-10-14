// Firebase Authentication helpers (identity only - profile data lives in Firestore).
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/firebase';

// Name typed on the register form; AuthProvider uses it when it creates the profile document.
export let pendingDisplayName = null;

export async function registerUser(displayName, email, password) {
  pendingDisplayName = displayName;
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user;
}
export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);

// Opens the Google popup. New players get an account; returning players are signed in.
export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  return cred.user;
}

export function friendlyAuthError(err) {
  const map = {
    'auth/popup-closed-by-user': 'The Google window was closed before finishing.',
    'auth/popup-blocked': 'Your browser blocked the Google popup. Allow popups for this site and try again.',
    'auth/email-already-in-use': 'That email is already registered. Try logging in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password is too weak - use at least 6 characters.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/user-not-found': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network problem. Check your internet connection.',
    'permission-denied': 'The database refused this action. Check your Firestore rules are published.',
  };
  return map[err?.code] || 'Something went wrong. Please try again.';
}
