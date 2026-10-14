// Level 1 (and final stage 1): count one kind of fruit in a jungle picture.
import { useEffect, useState } from 'react';

const FRUITS = ['🍌', '🍎', '🍊', '🍇', '🍓', '🍍'];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

function makeRound(maxCount) {
  const target = FRUITS[randInt(0, FRUITS.length - 1)];
  const count = randInt(3, maxCount);
  const others = FRUITS.filter((f) => f !== target);
  const fillers = Array.from({ length: randInt(4, 8) }, () => others[randInt(0, others.length - 1)]);
  const items = shuffle([...Array(count).fill(target), ...fillers]);
  const wrong = shuffle([count - 2, count - 1, count + 1, count + 2].filter((n) => n >= 1)).slice(0, 3);
  return { target, count, items, options: shuffle([count, ...wrong]) };
}

export default function FruitCountingGame({ stage, locked, hintTick, onCorrect, onWrong, onDone }) {
  const [round, setRound] = useState(() => makeRound(stage.maxCount));
  const [done, setDone] = useState(0);
  const [crossed, setCrossed] = useState([]);
  const [clue, setClue] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Event: hint earned -> cross out a wrong number; when none are left, say odd/even.
  useEffect(() => {
    if (hintTick === 0) return;
    const wrong = round.options.filter((o) => o !== round.count && !crossed.includes(o));
    if (wrong.length > 0) setCrossed((c) => [...c, wrong[0]]);
    else setClue(`The answer is an ${round.count % 2 === 0 ? 'EVEN' : 'ODD'} number.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintTick]);

  const pick = (n) => {
    if (locked || crossed.includes(n)) return;
    if (n === round.count) {
      onCorrect();
      const d = done + 1;
      setDone(d);
      setFeedback({ ok: true, text: 'Correct! 🍌' });
      if (d >= stage.goal) { onDone(); return; }
      setRound(makeRound(stage.maxCount)); setCrossed([]); setClue('');
    } else {
      setCrossed((c) => [...c, n]);
      setFeedback({ ok: false, text: 'Not quite - count again!' });
      onWrong();
    }
  };

  return (
    <div className="game card">
      <p className="muted">Round {Math.min(done + 1, stage.goal)} of {stage.goal}</p>
      <h3 className="rule">How many {round.target} can you see?</h3>
      <div className="sequence" aria-label="Fruit picture">{round.items.map((f, i) => <span key={i}>{f}</span>)}</div>
      <div className="row wrap center-row">
        {round.options.map((o) => <button key={o} className="btn fruit-btn" disabled={locked || crossed.includes(o)} onClick={() => pick(o)}>{o}</button>)}
      </div>
      {feedback && <p className={`msg ${feedback.ok ? 'success' : 'error'}`}>{feedback.text}</p>}
      {clue && <p className="hint-text">💡 {clue}</p>}
    </div>
  );
}
