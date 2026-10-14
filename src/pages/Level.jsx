// One page plays every level (1-4) and the final challenge (5), driven by config/gameConfig.js.
// Restarting remounts <LevelRun> (new key) so ALL state, timers and intervals reset cleanly.
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTimer } from '../hooks/useTimer';
import { ACHIEVEMENTS, FINAL_LEVEL_ID, LEVELS, MAX_LEVEL_SCORE, SCORING } from '../config/gameConfig';
import { recordRun } from '../services/progressService';
import { friendlyAuthError } from '../services/authService';
import HintModal from '../components/HintModal';
import FruitCountingGame from '../games/FruitCountingGame';
import FruitMemoryGame from '../games/FruitMemoryGame';
import FruitSequenceGame from '../games/FruitSequenceGame';
import FruitSortingGame from '../games/FruitSortingGame';

const GAMES = { counting: FruitCountingGame, memory: FruitMemoryGame, sequence: FruitSequenceGame, sorting: FruitSortingGame };
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function Level() {
  const { id } = useParams();
  const levelId = Number(id);
  const { profile } = useAuth();
  const [runId, setRunId] = useState(0);
  const level = LEVELS[levelId];
  if (!level) return <Navigate to="/dashboard" replace />;
  // Direct-URL guard (UI side). Firestore rules enforce the same rule on the server.
  if (profile.unlockedLevel < levelId) return <Navigate to="/dashboard" replace state={{ locked: levelId }} />;
  return <LevelRun key={`${levelId}-${runId}`} level={level} onRestart={() => setRunId((r) => r + 1)} />;
}

function LevelRun({ level, onRestart }) {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [modal, setModal] = useState(null); // null | 'hint' | 'restart'
  const [stageIdx, setStageIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(level.lives);
  const [hintsLeft, setHintsLeft] = useState(level.maxHints);
  const [hintTick, setHintTick] = useState(0);
  const [status, setStatus] = useState('playing'); // playing | won | lost
  const [reason, setReason] = useState('');
  const [breakdown, setBreakdown] = useState(null);
  const [save, setSave] = useState({ busy: false, error: '', result: null });

  // Refs mirror state so event handlers never read stale values.
  const scoreRef = useRef(0), livesRef = useRef(level.lives), hintsRef = useRef(level.maxHints);
  const statusRef = useRef('playing'), timeRef = useRef(level.seconds);
  const runRef = useRef(null), savedRef = useRef(false);

  const finish = (result, why = '') => {
    if (statusRef.current !== 'playing') return; // only ever finish once
    statusRef.current = result;
    const timeBonus = result === 'won' ? Math.min(SCORING.timeBonusCap, timeRef.current * SCORING.timeBonusPerSecond) : 0;
    const lifeBonus = result === 'won' ? livesRef.current * SCORING.lifeBonus : 0;
    const finalScore = Math.min(MAX_LEVEL_SCORE, Math.max(0, Math.round(scoreRef.current + timeBonus + lifeBonus)));
    runRef.current = {
      levelId: level.id, result, score: finalScore, hintsUsed: level.maxHints - hintsRef.current,
      timeLeft: Math.max(0, Math.round(timeRef.current)), lives: livesRef.current, seconds: level.seconds,
    };
    setBreakdown({ base: scoreRef.current, timeBonus, lifeBonus, finalScore });
    setReason(why);
    setStatus(result);
  };

  const { timeLeft, subtract } = useTimer({
    seconds: level.seconds,
    running: started && status === 'playing' && !modal, // paused during hint / restart dialogs
    onExpire: () => finish('lost', 'time'),
  });
  timeRef.current = timeLeft;

  const stage = level.stages[stageIdx];
  const Game = GAMES[stage.game];

  const addScore = (pts) => { scoreRef.current += pts; setScore(scoreRef.current); };
  const loseLife = () => {
    if (statusRef.current !== 'playing') return;
    livesRef.current -= 1; setLives(livesRef.current);
    if (livesRef.current <= 0) finish('lost', 'lives');
  };
  const stageDone = () => (stageIdx < level.stages.length - 1 ? setStageIdx((i) => i + 1) : finish('won'));
  const hintEarned = () => { // called once per completed challenge (guarded in HintModal)
    if (hintsRef.current <= 0) return;
    hintsRef.current -= 1; setHintsLeft(hintsRef.current); setHintTick((t) => t + 1);
  };

  const saveRun = async () => {
    setSave({ busy: true, error: '', result: null });
    try {
      const result = await recordRun(user.uid, runRef.current);
      await refreshProfile();
      setSave({ busy: false, error: '', result });
    } catch (e) {
      setSave({ busy: false, error: `${friendlyAuthError(e)} (${e.message})`, result: null });
    }
  };
  useEffect(() => {
    if (status === 'playing' || savedRef.current) return;
    savedRef.current = true; // duplicate-submission guard
    saveRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const locked = !started || status !== 'playing' || !!modal;
  const nextPath = level.id < FINAL_LEVEL_ID ? `/level/${level.id + 1}` : '/completion';

  return (
    <section className={`level theme-${level.theme}`}>
      <h1>{level.emoji} Level {level.id < 5 ? level.id : '★'} — {level.name}</h1>
      <div className="hud">
        <div className={`hud-item timer ${timeLeft <= 10 ? 'low' : ''}`}>⏱ {fmt(timeLeft)}</div>
        <div className="hud-item">{'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, level.lives - lives))}</div>
        <div className="hud-item">⭐ {score}</div>
        <div className="hud-item">💡 {hintsLeft}/{level.maxHints} hints left this attempt</div>
      </div>
      {timeLeft <= 10 && status === 'playing' && started && <p className="msg error">Hurry! Time is running out!</p>}

      <div className="row wrap">
        <button className="btn" disabled={locked || hintsLeft === 0} onClick={() => setModal('hint')}>💡 Hint</button>
        <button className="btn ghost" disabled={!started || status !== 'playing' || !!modal} onClick={() => setModal('restart')}>↻ Restart</button>
      </div>

      {!started && (
        <div className="card">
          <h2>{level.description}</h2>
          <ul>{level.rules.map((r) => <li key={r}>{r}</li>)}</ul>
          <p className="muted">Hints: earn each one by solving 2 real Banana API puzzles (max {level.maxHints} per attempt). Restart = fresh attempt, run score resets, saved best scores stay.</p>
          <button className="btn big" onClick={() => setStarted(true)}>Start!</button>
        </div>
      )}
      {started && status === 'playing' && level.stages.length > 1 && <p className="muted">Stage {stageIdx + 1} of {level.stages.length}</p>}
      {started && status === 'playing' && (
        <Game key={stageIdx} stage={stage} locked={locked} hintTick={hintTick}
          onCorrect={() => addScore(stage.points)} onWrong={loseLife} onPenalty={subtract} onDone={stageDone} />
      )}

      {modal === 'hint' && <HintModal onEarned={hintEarned} onClose={() => setModal(null)} />}
      {modal === 'restart' && (
        <div className="modal-back"><div className="modal card">
          <h2>Restart this level?</h2>
          <p>Your current attempt (timer, lives, score, hints) will reset. Saved progress and best scores are kept.</p>
          <div className="row"><button className="btn" onClick={onRestart}>Yes, restart</button><button className="btn ghost" onClick={() => setModal(null)}>Keep playing</button></div>
        </div></div>
      )}

      {status !== 'playing' && (
        <div className="card result">
          {status === 'won' ? (
            <>
              <h2>🎉 Level complete!</h2>
              <p>Run score: <b>{breakdown.finalScore}</b> (tasks {breakdown.base} + time bonus {breakdown.timeBonus} + lives bonus {breakdown.lifeBonus})</p>
            </>
          ) : (
            <>
              <h2>💥 Game over</h2>
              <p>{reason === 'time' ? "Time's up!" : 'You ran out of lives.'} Try again - you can do it!</p>
            </>
          )}
          {save.busy && <p className="loading">Saving to your account…</p>}
          {save.error && <p className="msg error">{save.error} <button className="btn small" onClick={saveRun}>Retry save</button></p>}
          {save.result && status === 'won' && (
            <>
              <p className="msg success">Saved! +{save.result.delta} points added to your total ({save.result.total}).</p>
              {save.result.newAchievements.map((a) => <p key={a}>🎖 New: {ACHIEVEMENTS[a].icon} {ACHIEVEMENTS[a].name}</p>)}
            </>
          )}
          <div className="row wrap">
            {status === 'won' && <button className="btn" disabled={!save.result} onClick={() => navigate(nextPath)}>{level.id === FINAL_LEVEL_ID ? 'See completion screen' : level.id === 4 ? 'Final Treasure Challenge ➜' : 'Next level ➜'}</button>}
            <button className="btn ghost" onClick={onRestart}>{status === 'won' ? 'Replay' : 'Try again'}</button>
            <Link className="btn ghost" to="/dashboard">Dashboard</Link>
          </div>
        </div>
      )}
    </section>
  );
}
