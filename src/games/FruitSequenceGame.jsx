// Level 2: find the next fruit in a pattern. stage.hard = true adds tougher pattern types.
import { useEffect, useState } from 'react';

const POOL = ['🍎', '🍌', '🍊', '🍇', '🍓', '🍍', '🥝', '🍉'];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

function makeRound({ choices, maxPeriod, hard }) {
  const types = hard ? ['cycle', 'double', 'interleave', 'bounce'] : maxPeriod >= 3 ? ['cycle', 'double'] : ['cycle'];
  const type = types[randInt(0, types.length - 1)];
  const base = shuffle(POOL);
  let item, shownCount, rule;

  if (type === 'cycle') {
    const p = randInt(2, maxPeriod);
    item = (i) => base[i % p]; shownCount = p * 2 + 1;
    rule = `The same ${p} fruits repeat in the same order.`;
  } else if (type === 'double') {
    const p = randInt(2, maxPeriod);
    item = (i) => base[Math.floor(i / 2) % p]; shownCount = p * 2 + 1;
    rule = 'Each fruit appears twice in a row, then the next fruit comes.';
  } else if (type === 'interleave') {
    // Two patterns woven together: even positions repeat 2 fruits, odd positions repeat 3 fruits.
    item = (i) => (i % 2 === 0 ? base[(i / 2) % 2] : base[2 + (((i - 1) / 2) % 3)]); shownCount = 9;
    rule = 'Two patterns are mixed: look at every other fruit separately.';
  } else {
    // Bounce: goes forward through the fruits, then backwards, then forwards again.
    const p = randInt(3, 4), m = 2 * (p - 1);
    item = (i) => { const k = i % m; return base[k < p ? k : m - k]; }; shownCount = m + 3;
    rule = 'The pattern walks forward through the fruits, then backwards.';
  }

  const shown = Array.from({ length: shownCount }, (_, i) => item(i));
  const answer = item(shownCount);
  const wrong = shuffle(POOL.filter((f) => f !== answer)).slice(0, choices - 1);
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
