import { useEffect, useState, type CSSProperties } from "react";
import type { Achievement, DailyLog, Mission, WorkoutDay, XpSnapshot } from "../../types/gymcord";
import { workouts } from "../../lib/program";
import { WorkoutDayCard } from "./WorkoutDayCard";
import { buildWorkoutSession, getExerciseKey } from "../../lib/engines/workoutSessionEngine";
import { buildRestTimer, formatTimer, resolveTimerDuration, type RestTimerPreset } from "../../lib/engines/restTimerEngine";
import { buildWorkoutProgress } from "../../lib/engines/workoutProgressEngine";
import { buildPersonalRecords } from "../../lib/engines/personalRecordEngine";
import { buildCompletionSnapshot } from "../../lib/engines/completionEngine";

export function Train({
  dayLog,
  updateDay,
  mission,
  xp,
  achievements,
}: {
  dayLog: DailyLog;
  updateDay: (patch: Partial<DailyLog>) => void;
  mission: Mission;
  xp: XpSnapshot;
  achievements: Achievement[];
}) {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutDay | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerPreset, setTimerPreset] = useState<RestTimerPreset>(90);
  const [customSeconds, setCustomSeconds] = useState(120);
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [complete, setComplete] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const timerDuration = resolveTimerDuration(timerPreset, customSeconds);

  useEffect(() => {
    setTimer(timerDuration);
    setRunning(false);
    setTimerComplete(false);
  }, [timerDuration]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTimer((time) => {
        if (time <= 1) {
          setRunning(false);
          setTimerComplete(true);
          return 0;
        }

        return time - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  function startWorkout(workout: WorkoutDay) {
    setActiveWorkout(workout);
    setActiveIndex(0);
    setComplete(false);
    setStartedAt(Date.now());
  }

  if (!activeWorkout) {
    return (
      <section className="page">
        <div className="panel">
          <h3>Training Plan</h3>
          <p>
            Choose today&apos;s workout. Start Workout now opens a full-screen immersive session with guided exercises, rest timers, PR tracking, and a premium finish.
          </p>
        </div>

        {workouts.map((workout) => (
          <WorkoutDayCard key={workout.id} workout={workout} onStart={() => startWorkout(workout)} />
        ))}
      </section>
    );
  }

  const session = buildWorkoutSession(activeWorkout, dayLog, activeIndex);
  const progress = buildWorkoutProgress(activeWorkout, dayLog);
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
  const records = buildPersonalRecords(activeWorkout, dayLog, elapsedMinutes);
  const completion = buildCompletionSnapshot(progress, xp, mission, achievements, records);
  const rest = buildRestTimer(timerDuration, timer, running, timerComplete);
  const exercise = session.activeExercise;
  const exerciseKey = getExerciseKey(activeWorkout.id, exercise.id);
  const isExerciseComplete = !!dayLog.completedExercises[exerciseKey];

  if (complete) {
    return (
      <section className="workout-session workout-complete-screen">
        <div className="completion-burst">✦</div>
        <p className="pill">Workout Complete</p>
        <h2>{activeWorkout.title} crushed.</h2>
        <p>{completion.atlasSummary}</p>

        <div className="completion-grid">
          <div><strong>+{completion.xpEarned}</strong><span>XP earned</span></div>
          <div><strong>{completion.levelProgress}%</strong><span>Level progress</span></div>
          <div><strong>{completion.missionCompletion}%</strong><span>Mission completion</span></div>
          <div><strong>+{completion.momentumIncrease}</strong><span>Momentum</span></div>
        </div>

        <div className="panel completion-panel">
          <h3>Unlocked</h3>
          {completion.achievementsUnlocked.length ? completion.achievementsUnlocked.map((item) => <span className="unlock-chip" key={item}>🏆 {item}</span>) : <span className="unlock-chip">Mission progress banked</span>}
        </div>

        <button className="primary-button" onClick={() => setActiveWorkout(null)}>Continue</button>
      </section>
    );
  }

  return (
    <section className="workout-session">
      <div className="session-topbar">
        <button className="session-exit-button" onClick={() => setActiveWorkout(null)} aria-label="Exit workout session">Exit</button>
        <div className="session-title">
          <p className="eyebrow">Workout Session</p>
          <h2>{activeWorkout.title}</h2>
        </div>
        <button className="finish-workout-button" onClick={() => setComplete(true)}>Finish Workout</button>
      </div>

      <div className="session-progress-row">
        <div className="progress-ring" style={{ "--progress": `${progress.progressPercentage}%` } as CSSProperties}>
          <span>{progress.progressPercentage}%</span>
        </div>
        <div className="progress-stats">
          <span>{progress.exercisesCompleted}/{progress.totalExercises} exercises</span>
          <span>{progress.setsCompleted}/{progress.totalSets} sets</span>
          <span>{progress.estimatedRemainingTime} min left</span>
          <span>+{progress.xpEarned} XP · {progress.caloriesEstimate} cal</span>
        </div>
      </div>

      <article className="session-exercise-card" onTouchStart={(event) => (event.currentTarget.dataset.touchX = String(event.touches[0].clientX))} onTouchEnd={(event) => {
        const start = Number(event.currentTarget.dataset.touchX || 0);
        const delta = event.changedTouches[0].clientX - start;
        if (delta < -45 && session.canGoNext) setActiveIndex(activeIndex + 1);
        if (delta > 45 && session.canGoPrevious) setActiveIndex(activeIndex - 1);
      }}>
        <div className="exercise-photo-placeholder">
          {exercise.image ? <img src={exercise.image} alt={exercise.name} /> : <span>Exercise image</span>}
        </div>
        <div className="exercise-count">{activeIndex + 1} / {session.exercises.length}</div>
        <h3>{exercise.name}</h3>
        <p>{exercise.description}</p>
        <div className="prescription-grid">
          <div><strong>{exercise.sets}</strong><span>Sets</span></div>
          <div><strong>{exercise.reps}</strong><span>Reps</span></div>
          <div><strong>{dayLog.weights[exerciseKey] || "—"}</strong><span>Weight</span></div>
        </div>
        <div className="cue-list">{exercise.cues.map((cue) => <span className="cue-chip" key={cue}>✓ {cue}</span>)}</div>
        <input className="input" placeholder="Weight used / reps / notes" value={dayLog.weights[exerciseKey] || ""} onChange={(e) => updateDay({ weights: { ...dayLog.weights, [exerciseKey]: e.target.value } })} />
        <button className={isExerciseComplete ? "complete-set done" : "complete-set"} onClick={() => updateDay({ completedExercises: { ...dayLog.completedExercises, [exerciseKey]: !isExerciseComplete } })}>
          {isExerciseComplete ? "Completed ✓" : "Mark Exercise Complete"}
        </button>
      </article>

      <div className="session-nav"><button disabled={!session.canGoPrevious} onClick={() => setActiveIndex(activeIndex - 1)}>Previous</button><button disabled={!session.canGoNext} onClick={() => setActiveIndex(activeIndex + 1)}>Next</button></div>

      <div className={`rest-timer ${rest.completed ? "timer-finished" : ""}`}>
        <div className="timer-orb" style={{ "--timer": `${rest.progressPercentage}%` } as CSSProperties}><strong>{formatTimer(timer)}</strong><span>{rest.hapticEvent === "complete" ? "Completion pulse ready" : "Haptic-ready rest"}</span></div>
        <div className="timer-actions">
          {[60, 90].map((preset) => <button key={preset} onClick={() => setTimerPreset(preset as RestTimerPreset)}>{preset}s</button>)}
          <button onClick={() => setTimerPreset("custom")}>Custom</button>
          <input className="input timer-input" type="number" min="10" max="600" value={customSeconds} onChange={(event) => setCustomSeconds(Number(event.target.value))} />
          <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</button>
        </div>
      </div>

      <div className="pr-strip">{records.filter((record) => record.isNew).map((record) => <span key={record.type}>✨ New PR: {record.title} {record.value}{record.unit}</span>)}</div>

      <div className="session-bottom-actions" aria-label="Workout session actions">
        <button className="session-exit-button" onClick={() => setActiveWorkout(null)}>Exit</button>
        <button className="finish-workout-button" onClick={() => setComplete(true)}>Finish Workout</button>
      </div>
    </section>
  );
}
