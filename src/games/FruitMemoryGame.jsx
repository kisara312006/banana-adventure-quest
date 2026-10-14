// Level 2: flip cards and match pairs. A wrong pair costs time.
import { useEffect, useMemo, useRef, useState } from 'react';

const FRUITS = ['🍎', '🍌', '🍊', '🍇', '🍓', '🍍', '🥝', '🍉'];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

export default function FruitMemoryGame({ stage, locked, hintTick, onCorrect, onPenalty, onDone }) {
  const cards = useMemo(
    () => shuffle(shuffle(FRUITS).slice(0, stage.pairs).flatMap((e) => [e, e])).map((emoji, id) => ({ id, emoji })),
    [stage.pairs],
  );
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [busy, setBusy] = useState(false);
  const [hintIds, setHintIds] = useState([]);
  const [note, setNote] = useState('');
  const timeouts = useRef([]);
  const later = (fn, ms) => { timeouts.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  // Event: hint earned -> briefly reveal one unmatched pair.
  useEffect(() => {
    if (hintTick === 0) return;
    const emoji = shuffle(cards.filter((c) => !matched.includes(c.emoji)))[0]?.emoji;
    if (!emoji) return;
    setHintIds(cards.filter((c) => c.emoji === emoji).map((c) => c.id));
    later(() => setHintIds([]), 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintTick]);

  const flip = (card) => {
    if (locked || busy || flipped.includes(card.id) || matched.includes(card.emoji)) return;
    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length < 2) return;
    const [a, b] = next.map((id) => cards[id]);
    setBusy(true);
    if (a.emoji === b.emoji) {
      const m = [...matched, a.emoji];
      setMatched(m); setFlipped([]); setBusy(false); setNote('Match! ✨');
      onCorrect();
      if (m.length === stage.pairs) onDone();
    } else {
      setNote(`No match: -${stage.penaltySeconds}s`);
      onPenalty(stage.penaltySeconds);
      later(() => { setFlipped([]); setBusy(false); }, 700);
    }
  };

  return (
    <div className="game card">
      <p className="muted">Pairs found: {matched.length} / {stage.pairs}</p>
      <div className="memory-grid">
        {cards.map((c) => {
          const up = flipped.includes(c.id) || matched.includes(c.emoji) || hintIds.includes(c.id);
          return (
            <button key={c.id} className={`mem-card ${up ? 'up' : ''} ${hintIds.includes(c.id) ? 'glow' : ''}`}
              onClick={() => flip(c)} aria-label={up ? c.emoji : 'hidden card'}>
              {up ? c.emoji : '❓'}
            </button>
          );
        })}
      </div>
      <p className="muted">{note}</p>
    </div>
  );
}
