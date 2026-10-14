import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../services/authService';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  // Event: logout button click.
  const onLogout = async () => { await logoutUser(); navigate('/'); };
  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="brand">🍌 Banana Adventure Quest</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard">Play</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/profile" className="profile-btn" aria-label="Profile">{profile?.avatar || '🍌'} {profile?.displayName || 'Profile'}</Link>
            <button className="btn small ghost" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn small">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
