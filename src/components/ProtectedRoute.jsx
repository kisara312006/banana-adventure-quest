// Redirects to /login when nobody is signed in. (UI convenience only - the real
// protection is in firestore.rules.)
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, profile, loading, error } = useAuth();
  if (loading) return <LoadingSpinner text="Loading your adventure…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (error || !profile) return <div className="card msg error">{error || 'Profile unavailable.'}</div>;
  return children;
}
