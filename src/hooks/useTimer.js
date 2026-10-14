// Countdown timer. Counts down only while `running` is true (pause = running false).
// The interval is cleaned up whenever running changes or the component unmounts,
// so duplicate intervals cannot exist. To restart, remount the component (new key).
import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer({ seconds, running, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && timeLeft === 0) expireRef.current();
  }, [timeLeft, running]);

  const subtract = useCallback((s) => setTimeLeft((t) => Math.max(0, t - s)), []);
  return { timeLeft, subtract };
}
