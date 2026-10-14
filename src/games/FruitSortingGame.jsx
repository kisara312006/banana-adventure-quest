// Level 4 (and the final stage 3): select every fruit that matches a rule.
import { useEffect, useState } from 'react';

const FRUITS = [
  { e: '🍎', color: 'red', size: 'big' }, { e: '🍓', color: 'red', size: 'small' }, { e: '🍒', color: 'red', size: 'small' },
  { e: '🍌', color: 'yellow', size: 'big' }, { e: '🍋', color: 'yellow', size: 'small' }, { e: '🍍', color: 'yellow', size: 'big' },
  { e: '🍊', color: 'orange', size: 'big' }, { e: '🍇', color: 'purple', size: 'small' },
  { e: '🍏', color: 'green', size: 'big' }, { e: '🍐', color: 'green', size: 'big' },
  { e: '🥝', color: 'green', size: 'small' }, { e: '🍉', color: 'green', size: 'big' },
];
// Rules grouped by difficulty (more conditions = harder).
const RULES = {
  1: [{ text: 'Tap every RED fruit', test: (f) => f.color === 'red' }, { text: 'Tap every YELLOW fruit', test: (f) => f.color === 'yellow' }],
  2: [{ text: 'Tap every YELLOW or ORANGE fruit', test: (f) => ['yellow', 'orange'].includes(f.color) },
      { text: 'Tap every GREEN or PURPLE fruit', test: (f) => ['green', 'purple'].includes(f.color) }],
  3: [{ text: 'Tap every SMALL fruit that is NOT red', test: (f) => f.size === 'small' && f.color !== 'red' },
      { text: 'Tap every BIG fruit that is GREEN or YELLOW', test: (f) => f.size === 'big' && ['green', 'yellow'].includes(f.color) }],
};
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

function makeRound(difficulty) {
  const rule = shuffle(RULES[difficulty])[0];
  for (;;) {
    const grid = shuffle(FRUITS).slice(0, 9);
    const n = grid.filter(rule.test).length;
    if (n >= 2 && n <= 5) return { rule, grid };
  }
}

export default function FruitSortingGame({ stage, locked, hintTick, onCorrect, onWrong, onDone }) {
  const [round, setRound] = useState(() => makeRound(stage.difficulty));
  const [picked, setPicked] = useState([]);
  const [count, setCount] = useState(0);
  const [hintFruit, setHintFruit] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Event: hint earned -> highlight one correct fruit that is not selected yet.
  useEffect(() => {
    if (hintTick === 0) return;
    const f = round.grid.find((g) => round.rule.test(g) && !picked.includes(g.e));
    if (f) setHintFruit(f.e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintTick]);

  const toggle = (e) => { if (!locked) setPicked((p) => (p.includes(e) ? p.filter((x) => x !== e) : [...p, e])); };

  const check = () => {
    if (locked) return;
    const correct = round.grid.filter(round.rule.test).map((f) => f.e).sort().join();
    if (correct === [...picked].sort().join()) {
      onCorrect();
      const n = count + 1;
      setCount(n);
      setFeedback({ ok: true, text: 'Perfect sort! ✨' });
      if (n >= stage.goal) { onDone(); return; }
      setRound(makeRound(stage.difficulty)); setPicked([]); setHintFruit(null);
    } else {
      setFeedback({ ok: false, text: 'Not quite - check the rule again.' });
      onWrong();
    }
  };

  return (
    <div className="game card">
      <p className="muted">Round {Math.min(count + 1, stage.goal)} of {stage.goal}</p>
      <h3 className="rule">{round.rule.text}</h3>
      <div className="sort-grid">
        {round.grid.map((f) => (
          <button key={f.e} className={`sort-card ${picked.includes(f.e) ? 'picked' : ''} ${hintFruit === f.e ? 'glow' : ''}`}
            onClick={() => toggle(f.e)} aria-pressed={picked.includes(f.e)}>{f.e}</button>
        ))}
      </div>
      <button className="btn" disabled={locked || picked.length === 0} onClick={check}>Check</button>
      {feedback && <p className={`msg ${feedback.ok ? 'success' : 'error'}`}>{feedback.text}</p>}
    </div>
  );
}
