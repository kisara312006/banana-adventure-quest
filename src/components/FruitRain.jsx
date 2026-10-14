// Slow falling-fruit background. 16 elements, pointer-events:none, hidden when the
// user prefers reduced motion (see global.css).
import { useMemo } from 'react';
const ICONS = ['🍌', '🍎', '🍊', '🍇', '🍓', '🍍'];

export default function FruitRain() {
  const drops = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    icon: ICONS[i % ICONS.length], left: `${(i * 37) % 100}%`,
    duration: `${18 + (i * 7) % 14}s`, delay: `${-((i * 5) % 20)}s`, size: `${18 + (i * 3) % 16}px`,
  })), []);
  return (
    <div className="fruit-rain" aria-hidden="true">
      {drops.map((d, i) => <span key={i} style={{ left: d.left, animationDuration: d.duration, animationDelay: d.delay, fontSize: d.size }}>{d.icon}</span>)}
    </div>
  );
}
