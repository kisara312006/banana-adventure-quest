import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ACHIEVEMENTS } from '../config/gameConfig';

export default function Completion() {
  const { profile } = useAuth();
  if (!profile.completedLevels.includes(5)) return <Navigate to="/dashboard" replace />;
  return (
    <section className="card center">
      <div className="big-emoji">💎</div>
      <h1>Treasure found! You did it, {profile.displayName}!</h1>
      <p className="lead">Final score: <b>{profile.totalScore}</b> · Levels completed: {profile.completedLevels.length}/5</p>
      <div className="row wrap center-row">{profile.achievements.map((a) => <span key={a} className="badge">{ACHIEVEMENTS[a]?.icon} {ACHIEVEMENTS[a]?.name}</span>)}</div>
      <div className="row center-row"><Link className="btn big" to="/dashboard">Back to dashboard</Link><Link className="btn big ghost" to="/leaderboard">Leaderboard</Link></div>
    </section>
  );
}
