// Tracks the signed-in player (Firebase Auth) and loads their Firestore profile.
// (.jsx because this file contains JSX.)
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { ensureProfile, getProfile } from '../services/profileService';
import { pendingDisplayName } from '../services/authService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth) { setLoading(false); return undefined; }
    // Event: fires on page load, login and logout.
    return onAuthStateChanged(auth, async (u) => {
      setError('');
      if (!u) { setUser(null); setProfile(null); setLoading(false); return; }
      setLoading(true);
      try {
        setProfile(await ensureProfile(u, pendingDisplayName));
        setUser(u);
      } catch (e) {
        setError('Could not load your profile. Have you published the Firestore rules and created the database?');
        setUser(u);
      }
      setLoading(false);
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (auth?.currentUser) setProfile(await getProfile(auth.currentUser.uid));
  }, []);

  return <AuthContext.Provider value={{ user, profile, loading, error, refreshProfile }}>{children}</AuthContext.Provider>;
}
