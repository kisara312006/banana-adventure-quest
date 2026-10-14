// Banana API Challenge: solve TWO real Banana API puzzles to earn ONE hint.
// The main timer is paused while this modal is open (Level.jsx controls that).
import { useCallback, useRef, useState } from 'react';
import { checkAnswer, fetchPuzzle } from '../services/bananaApi';

export default function HintModal({ onEarned, onClose }) {
  const [step, setStep] = useState('rules'); // rules -> quiz -> done
  const [index, setIndex] = useState(0);     // 0 = first puzzle, 1 = second puzzle
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const earned = useRef(false); // guard: one completed challenge = one hint

  const load = useCallback(async () => {
    setLoading(true); setError(''); setAnswer('');
    try { setPuzzle(await fetchPuzzle()); }
    catch (e) { setPuzzle(null); setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const start = () => { setStep('quiz'); load(); };

  // Event: Submit click / Enter key.
  const submit = () => {
    if (earned.current || !puzzle || loading || answer.trim() === '') return;
    if (checkAnswer(puzzle, answer)) {
      if (index === 0) { setFeedback({ ok: true, text: 'Correct! One more to go…' }); setIndex(1); load(); }
      else { earned.current = true; onEarned(); setStep('done'); }
    } else {
      setFeedback({ ok: false, text: 'Not quite - here is a new puzzle for this question.' });
      load(); // retry rule: unlimited retries, progress on correct puzzles is kept
    }
  };

  return (
    <div className="modal-back" role="dialog" aria-modal="true">
      <div className="modal card">
        <h2>🍌 Banana API Challenge</h2>
        {step === 'rules' && (
          <>
            <p>Solve <b>two</b> Banana puzzles to earn <b>one hint</b>. The game timer is paused. If you answer wrongly you get a new puzzle for that question (unlimited retries). A hint is only given after both are correct.</p>
            <div className="row"><button className="btn" onClick={start}>Start</button><button className="btn ghost" onClick={onClose}>Cancel</button></div>
          </>
        )}
        {step === 'quiz' && (
          <>
            <p className="muted">Puzzle {index + 1} of 2 - type the missing digit.</p>
            {loading && <p className="loading">Fetching a banana puzzle… 🍌</p>}
            {error && <p className="msg error">{error} <button className="btn small" onClick={load}>Retry</button></p>}
            {puzzle && !loading && (
              <>
                <img className="puzzle-img" src={puzzle.imageUrl} alt="Banana puzzle: find the missing digit" />
                <div className="row">
                  <input className="input digit" inputMode="numeric" maxLength={2} value={answer} placeholder="?"
                    onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && submit()} aria-label="Your answer" />
                  <button className="btn" onClick={submit}>Submit</button>
                </div>
              </>
            )}
            {feedback && <p className={`msg ${feedback.ok ? 'success' : 'error'}`}>{feedback.text}</p>}
            <button className="btn ghost small" onClick={onClose}>Cancel (no hint)</button>
          </>
        )}
        {step === 'done' && (
          <>
            <p className="msg success">Hint earned! 🎉 It will appear in the game.</p>
            <button className="btn" onClick={onClose}>Back to the game</button>
          </>
        )}
      </div>
    </div>
  );
}
