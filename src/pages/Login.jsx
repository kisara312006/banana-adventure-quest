import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { friendlyAuthError, loginUser, loginWithGoogle } from '../services/authService';
import GoogleIcon from '../components/GoogleIcon';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // Event: Login button click / Enter key.
  const submit = async () => {
    if (busy) return;
    setError('');
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setBusy(true);
    try { await loginUser(email.trim(), password); navigate('/dashboard'); }
    catch (e) { setError(friendlyAuthError(e)); setBusy(false); }
  };

  // Event: "Continue with Google" button click.
  const google = async () => {
    if (busy) return;
    setError(''); setBusy(true);
    try { await loginWithGoogle(); navigate('/dashboard'); }
    catch (e) { setError(friendlyAuthError(e)); setBusy(false); }
  };

  return (
    <section className="card auth">
      <h1>Welcome back 🍌</h1>
      <label>Email<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /></label>
      {error && <p className="msg error">{error}</p>}
      <div className="auth-actions">
        <button className="btn big" disabled={busy} onClick={submit}>{busy ? 'Logging in…' : 'Login'}</button>
        <button className="btn big ghost" disabled={busy} onClick={google}><GoogleIcon />Continue with Google</button>
      </div>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
    </section>
  );
}