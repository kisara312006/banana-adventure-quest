import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { friendlyAuthError, registerUser } from '../services/authService';

export default function Register() {
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  // Event: Register button click / Enter key. Validates, then creates the Firebase account.
  // The Firestore profile document is created by AuthProvider right after sign-in.
  const submit = async () => {
    if (busy) return;
    setError('');
    const name = f.name.trim();
    if (name.length < 2 || name.length > 20) return setError('Display name must be 2-20 characters.');
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError('Please enter a valid email address.');
    if (f.password.length < 6) return setError('Password must be at least 6 characters.');
    if (f.password !== f.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try { await registerUser(name, f.email.trim(), f.password); navigate('/dashboard'); }
    catch (e) { setError(friendlyAuthError(e)); setBusy(false); }
  };

  return (
    <section className="card auth">
      <h1>Join the quest 🍎</h1>
      <label>Display name<input className="input" value={f.name} onChange={set('name')} /></label>
      <label>Email<input className="input" type="email" value={f.email} onChange={set('email')} /></label>
      <label>Password<input className="input" type="password" value={f.password} onChange={set('password')} /></label>
      <label>Confirm password<input className="input" type="password" value={f.confirm} onChange={set('confirm')} onKeyDown={(e) => e.key === 'Enter' && submit()} /></label>
      {error && <p className="msg error">{error}</p>}
      <button className="btn big" disabled={busy} onClick={submit}>{busy ? 'Creating account…' : 'Register'}</button>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </section>
  );
}
