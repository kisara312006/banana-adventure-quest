// Tracks the signed-in player (Firebase Auth), loads their Firestore profile,
// and claims the single active session (see services/sessionService.js).
// (.jsx because this file contains JSX.)
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { ensureProfile, getProfile } from '../services/profileService';
import { pendingDisplayName } from '../services/authService';
import { claimSession } from '../services/sessionService';
import { setNotice } from '../services/noticeService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sessionAuthTime, setSessionAuthTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth) { setLoading(false); return undefined; }
    // Event: fires on page load, login and logout.
    return onAuthStateChanged(auth, async (u) => {
      setError('');
      if (!u) { setUser(null); setProfile(null); setSessionAuthTime(null); setLoading(false); return; }
      setLoading(true);
      try {
        const p = await ensureProfile(u, pendingDisplayName);
        const session = await claimSession(u);
        if (session.superseded) {
          setNotice('You were signed out because this account signed in on another device.');
          await signOut(auth);
          return; // the next onAuthStateChanged(null) call finishes the cleanup
        }
        setProfile(p); setSessionAuthTime(session.mine); setUser(u);
      } catch (e) {
        setError('Could not load your profile or session. Have you published the Firestore rules and created the database?');
        setUser(u);
      }
      setLoading(false);
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (auth?.currentUser) setProfile(await getProfile(auth.currentUser.uid));
  }, []);

  return <AuthContext.Provider value={{ user, profile, sessionAuthTime, loading, error, refreshProfile }}>{children}</AuthContext.Provider>;
}
