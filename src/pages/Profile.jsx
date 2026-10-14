import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ACHIEVEMENTS, AVATARS } from '../config/gameConfig';
import { loadProgress } from '../services/progressService';
import { updateProfileFields } from '../services/profileService';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile.displayName);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({});

  useEffect(() => { loadProgress(user.uid).then(setProgress).catch(() => {}); }, [user.uid]);

  // Event: Save button click -> update Firestore users/{uid} (and leaderboard entry if present).
  const save = async () => {
    const n = name.trim();
    if (n.length < 2 || n.length > 20) return setMsg({ ok: false, text: 'Name must be 2-20 characters.' });
    setBusy(true); setMsg(null);
    try {
      await updateProfileFields(user.uid, profile, { displayName: n, avatar });
      await refreshProfile();
      setMsg({ ok: true, text: 'Profile saved!' });
    } catch { setMsg({ ok: false, text: 'Could not save. Check your connection and Firestore rules.' }); }
    setBusy(false);
  };

  const created = profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : '—';
  return (
    <section className="card">
      <h1>{profile.avatar} Your profile</h1>
      <div className="stats">
        <div><b>{profile.totalScore}</b><span>Total score</span></div>
        <div><b>{profile.bestRun}</b><span>Best single run</span></div>
        <div><b>{profile.gamesPlayed}</b><span>Games played</span></div>
        <div><b>{profile.completedLevels.length}</b><span>Levels completed</span></div>
        <div><b>{profile.unlockedLevel}</b><span>Highest unlocked</span></div>
        <div><b>{profile.hintsUsed}</b><span>Hints used</span></div>
      </div>
      <p>📧 {profile.email} · 📅 Joined {created}</p>

      <h2>Edit</h2>
      <label>Display name<input className="input" value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="row wrap">{AVATARS.map((a) => <button key={a} className={`avatar-pick ${avatar === a ? 'sel' : ''}`} onClick={() => setAvatar(a)}>{a}</button>)}</div>
      <button className="btn" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>
      {msg && <p className={`msg ${msg.ok ? 'success' : 'error'}`}>{msg.text}</p>}

      <h2>Level results</h2>
      {Object.keys(progress).length === 0 ? <p className="muted">No completed levels yet - go play!</p> : (
        <ul>{Object.entries(progress).sort().map(([id, p]) => <li key={id}>Level {id}: best {p.bestScore} · completed {p.timesCompleted}×</li>)}</ul>
      )}
      <h2>Achievements</h2>
      {profile.achievements.length === 0 ? <p className="muted">None yet.</p> : (
        <div className="row wrap">{profile.achievements.map((a) => <span key={a} className="badge">{ACHIEVEMENTS[a]?.icon} {ACHIEVEMENTS[a]?.name || a}</span>)}</div>
      )}
    </section>
  );
}
