// Session control while logged in:
//  1) idle timeout with a warning,  2) maximum session length,  3) sign out if a newer login exists elsewhere.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../services/authService';
import { watchSession } from '../services/sessionService';
import { setNotice } from '../services/noticeService';
import { IDLE_MS, MAX_SESSION_MS, WARN_MS } from '../config/sessionConfig';

export default function SessionGuard() {
  const { user, sessionAuthTime } = useAuth();
  const navigate = useNavigate();
  const lastActive = useRef(Date.now());
  const warning = useRef(false);
  const ending = useRef(false);
  const [warnLeft, setWarnLeft] = useState(null);

  const endSession = async (message) => {
    if (ending.current) return;
    ending.current = true;
    setNotice(message);
    await logoutUser();
    navigate('/login');
  };
  const endRef = useRef(endSession);
  endRef.current = endSession;

  // Idle + maximum-length timers. Events (mouse, keys, touch) count as activity.
  useEffect(() => {
    if (!user) return undefined;
    ending.current = false; warning.current = false; lastActive.current = Date.now(); setWarnLeft(null);
    const bump = () => { if (!warning.current) lastActive.current = Date.now(); };
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const id = setInterval(() => {
      const now = Date.now();
      const idle = now - lastActive.current;
      if (sessionAuthTime && now - sessionAuthTime > MAX_SESSION_MS) { endRef.current('Your session reached its maximum length. Please log in again.'); return; }
      if (idle >= IDLE_MS) { endRef.current('You were signed out after being inactive.'); return; }
      if (idle >= IDLE_MS - WARN_MS) { warning.current = true; setWarnLeft(Math.ceil((IDLE_MS - idle) / 1000)); }
      else { warning.current = false; setWarnLeft(null); }
    }, 1000);
    return () => { clearInterval(id); events.forEach((e) => window.removeEventListener(e, bump)); };
  }, [user, sessionAuthTime]);

  // Single active session: sign out if a newer sign-in appears on another device.
  useEffect(() => {
    if (!user || !sessionAuthTime) return undefined;
    return watchSession(user.uid, sessionAuthTime, () => endRef.current('You were signed out because this account signed in on another device.'));
  }, [user, sessionAuthTime]);

  if (!user || warnLeft === null) return null;
  const stay = () => { lastActive.current = Date.now(); warning.current = false; setWarnLeft(null); };
  return (
    <div className="modal-back" role="alertdialog" aria-modal="true">
      <div className="modal card">
        <h2>Still there? ⏳</h2>
        <p>You will be signed out in <b>{warnLeft}</b> seconds because of inactivity.</p>
        <div className="row"><button className="btn" onClick={stay}>Stay signed in</button><button className="btn ghost" onClick={() => endSession('You logged out.')}>Log out now</button></div>
      </div>
    </div>
  );
}
