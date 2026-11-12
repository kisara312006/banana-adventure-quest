// Level 1: find the odd fruit out in a 3x3 grid of look-alike fruits.
import { useEffect, useState } from 'react';

const PAIRS = [['🍎', '🍅'], ['🍋', '🍌'], ['🍊', '🍑'], ['🍓', '🍒'], ['🍏', '🥑'], ['🍐', '🥝']];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

function makeRound() {
  const [main, odd] = shuffle(shuffle(PAIRS)[0]);
  const oddIndex = Math.floor(Math.random() * 9);
  return { cells: Array.from({ length: 9 }, (_, i) => (i === oddIndex ? odd : main)), oddIndex };
}

export default function OddOneOutGame({ stage, locked, hintTick, onCorrect, onWrong, onDone }) {
  const [round, setRound] = useState(makeRound);
  const [done, setDone] = useState(0);
  const [faded, setFaded] = useState([]);   // cells removed by hints or wrong taps
  const [feedback, setFeedback] = useState(null);

  // Event: hint earned -> fade out 3 cells that are NOT the odd one.
  useEffect(() => {
    if (hintTick === 0) return;
    const wrong = shuffle(round.cells.map((_, i) => i).filter((i) => i !== round.oddIndex && !faded.includes(i))).slice(0, 3);
    setFaded((f) => [...f, ...wrong]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintTick]);

  const pick = (i) => {
    if (locked || faded.includes(i)) return;
    if (i === round.oddIndex) {
      onCorrect();
      const d = done + 1;
      setDone(d);
      setFeedback({ ok: true, text: 'Found it! 🍌' });
      if (d >= stage.goal) { onDone(); return; }
      setRound(makeRound()); setFaded([]);
    } else {
      setFaded((f) => [...f, i]);
      setFeedback({ ok: false, text: 'That one matches the others!' });
      onWrong();
    }
  };

  return (
    <div className="game card">
      <p className="muted">Round {Math.min(done + 1, stage.goal)} of {stage.goal}</p>
      <h3 className="rule">Tap the fruit that is different!</h3>
      <div className="sort-grid">
        {round.cells.map((f, i) => (
          <button key={i} className="sort-card" style={faded.includes(i) ? { opacity: 0.2 } : undefined}
            disabled={locked || faded.includes(i)} onClick={() => pick(i)} aria-label="fruit">{f}</button>
        ))}
      </div>
      {feedback && <p className={`msg ${feedback.ok ? 'success' : 'error'}`}>{feedback.text}</p>}
    </div>
  );
}
