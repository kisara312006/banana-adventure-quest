// Firebase setup. The VITE_ values come from your local .env file (or Netlify settings).
// They are public configuration, NOT secrets. Security is enforced by firestore.rules.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
export const firebaseConfigError = missing.length
  ? `Missing Firebase settings: ${missing.join(', ')}. Create a .env file (see .env.example) and restart "npm run dev".`
  : null;

const app = firebaseConfigError ? null : initializeApp(firebaseConfig);
export const auth = app ? getAuth(app) : null;   // identity (who is the player?)
export const db = app ? getFirestore(app) : null; // data (what did the player save?)
