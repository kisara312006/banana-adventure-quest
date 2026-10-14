import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTopPlayers } from '../services/leaderboardService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getTopPlayers().then(setRows).catch(() => setError('Could not load the leaderboard.')); }, []);

  return (
    <section className="card">
      <h1>🏆 Leaderboard</h1>
      {error && <p className="msg error">{error}</p>}
      {!rows && !error && <LoadingSpinner />}
      {rows && rows.length === 0 && <p className="muted">No scores yet. Be the first to complete a level!</p>}
      {rows && rows.length > 0 && (
        <table className="table">
          <thead><tr><th>#</th><th>Player</th><th>Levels</th><th>Score</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r.id} className={r.id === user?.uid ? 'me' : ''}>
              <td>{i + 1}</td><td>{r.avatar} {r.displayName}</td><td>{r.levelsCompleted}/5</td><td>{r.totalScore}</td>
            </tr>))}</tbody>
        </table>
      )}
    </section>
  );
}
