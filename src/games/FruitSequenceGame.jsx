// Level 3: find the next fruit in a pattern.
import { useEffect, useState } from 'react';

const POOL = ['🍎', '🍌', '🍊', '🍇', '🍓', '🍍', '🥝', '🍉'];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

function makeRound({ choices, maxPeriod }) {
  const period = randInt(2, maxPeriod);
  const base = shuffle(POOL).slice(0, period);
  const type = maxPeriod >= 3 && Math.random() < 0.5 ? 'double' : 'cycle';
  const item = (i) => (type === 'cycle' ? base[i % period] : base[Math.floor(i / 2) % period]);
  const shownCount = period * 2 + 1;
  const shown = Array.from({ length: shownCount }, (_, i) => item(i));
  const answer = item(shownCount);
  const wrong = shuffle(POOL.filter((f) => f !== answer)).slice(0, choices - 1);
  const rule = type === 'cycle'
    ? `The same ${period} fruits repeat in the same order.`
    : 'Each fruit appears twice in a row, then the next fruit comes.';
  return { shown, answer, options: shuffle([answer, ...wrong]), rule };
}

export default function FruitSequenceGame({ stage, locked, hintTick, onCorrect, onWrong, onDone }) {
  const [round, setRound] = useState(() => makeRound(stage));
  const [count, setCount] = useState(0);
  const [showRule, setShowRule] = useState(false);
  const [crossed, setCrossed] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // Event: hint earned -> first explain the rule, later hints cross out a wrong choice.
  useEffect(() => {
    if (hintTick === 0) return;
    if (!showRule) { setShowRule(true); return; }
    const wrong = round.options.filter((o) => o !== round.answer && !crossed.includes(o));
    if (wrong.length > 0) setCrossed((c) => [...c, wrong[0]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintTick]);

  const pick = (fruit) => {
    if (locked || crossed.includes(fruit)) return;
    if (fruit === round.answer) {
      onCorrect();
      const n = count + 1;
      setCount(n);
      setFeedback({ ok: true, text: 'Correct! 🍊' });
      if (n >= stage.goal) { onDone(); return; }
      setRound(makeRound(stage)); setShowRule(false); setCrossed([]);
    } else {
      setCrossed((c) => [...c, fruit]);
      setFeedback({ ok: false, text: 'Not that one!' });
      onWrong();
    }
  };

  return (
    <div className="game card">
      <p className="muted">Pattern {Math.min(count + 1, stage.goal)} of {stage.goal} - what comes next?</p>
      <div className="sequence">
        {round.shown.map((f, i) => <span key={i}>{f}</span>)}<span className="q">❓</span>
      </div>
      <div className="row wrap">
        {round.options.map((o) => (
          <button key={o} className="btn fruit-btn" disabled={locked || crossed.includes(o)} onClick={() => pick(o)}>{o}</button>
        ))}
      </div>
      {feedback && <p className={`msg ${feedback.ok ? 'success' : 'error'}`}>{feedback.text}</p>}
      {showRule && <p className="hint-text">💡 {round.rule}</p>}
    </div>
  );
}
