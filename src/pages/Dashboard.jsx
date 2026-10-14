import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LEVELS } from '../config/gameConfig';
import { loadProgress } from '../services/progressService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgress(user.uid).then(setProgress).catch(() => setError('Could not load level progress.'));
  }, [user.uid]);

  const pct = Math.round((profile.completedLevels.length / 5) * 100);
  return (
    <section>
      <div className="card profile-strip">
        <div className="avatar">{profile.avatar}</div>
        <div>
          <h1>Hi bn, {profile.displayName}!</h1>
          <p>⭐ Total score <b>{profile.totalScore}</b> · 🏁 Levels done {profile.completedLevels.length}/5 · 🎖 Rewards {profile.achievements.length}</p>
          <div className="bar"><div style={{ width: `${pct}%` }} /></div>
          <p className="muted">Every level gives you a fresh set of lives (2-3) each attempt.</p>
        </div>
      </div>
      {location.state?.locked && <p className="msg error">Level {location.state.locked} is still locked - finish the previous level first.</p>}
      {error && <p className="msg error">{error}</p>}
      {!progress && !error ? <LoadingSpinner /> : (
        <div className="level-grid">
          {Object.values(LEVELS).map((l) => {
            const open = profile.unlockedLevel >= l.id;
            const done = profile.completedLevels.includes(l.id);
            const best = progress?.[l.id]?.bestScore;
            return (
              <div key={l.id} className={`card level-card theme-${l.theme} ${open ? '' : 'locked'}`}>
                <div className="big-emoji">{open ? l.emoji : '🔒'}</div>
                <h3>{l.id < 5 ? `Level ${l.id}` : 'Final'}: {l.name}</h3>
                <p className="muted">{l.description}</p>
                <p>⏱ {Math.floor(l.seconds / 60)}:{String(l.seconds % 60).padStart(2, '0')} · ❤️ {l.lives} · 💡 {l.maxHints}</p>
                {done && <p className="msg success">✔ Completed{best !== undefined ? ` · best ${best}` : ''}</p>}
                {open ? <Link className="btn" to={`/level/${l.id}`}>{done ? 'Replay' : 'Play'}</Link> : <button className="btn" disabled>Locked</button>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
