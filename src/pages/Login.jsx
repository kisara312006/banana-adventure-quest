import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { friendlyAuthError, loginUser, loginWithGoogle } from '../services/authService';
import { clearNotice, peekNotice } from '../services/noticeService';
import GoogleButton from '../components/GoogleButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice] = useState(peekNotice);   // e.g. "signed out after being inactive"
  const navigate = useNavigate();
  useEffect(() => { clearNotice(); }, []);

  // Event: Login button click / Enter key.
  const submit = async () => {
    if (busy) return;
    setError('');
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setBusy(true);
    try { await loginUser(email.trim(), password, remember); navigate('/dashboard'); }
    catch (e) { setError(friendlyAuthError(e)); setBusy(false); }
  };

  // Event: "Continue with Google" button click.
  const google = async () => {
    if (busy) return;
    setError(''); setBusy(true);
    try { await loginWithGoogle(remember); navigate('/dashboard'); }
    catch (e) { setError(friendlyAuthError(e)); setBusy(false); }
  };

  return (
    <section className="card auth">
      <h1>Welcome back 🍌</h1>
      {notice && <p className="msg error">{notice}</p>}
      <label>Email<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /></label>
      <label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me on this device</label>
      {error && <p className="msg error">{error}</p>}
      <button className="btn big" disabled={busy} onClick={submit}>{busy ? 'Logging in…' : 'Login'}</button>
      <p className="divider">or</p>
      <GoogleButton disabled={busy} onClick={google} />      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
    </section>
  );
}
