import { useEffect, useMemo, useState } from "react";
import type { DailyLog, Page, Profile } from "./types/gymcord";

import { workouts } from "./lib/program";
import {
  createEmptyDay,
  createEmptyProfile,
  getLastSevenDays,
  saved,
  save,
  todayKey,
} from "./lib/storage";
import {
  calculateTransformationScore,
  calculateWorkoutCompletion,
} from "./lib/scoring";
import { buildDailyMission } from "./lib/engines/missionEngine";
import { buildXpSnapshot } from "./lib/engines/xpEngine";
import { buildStreakSnapshot } from "./lib/engines/streakEngine";
import { buildAchievements, getNextAchievement } from "./lib/engines/achievementEngine";
import { buildAtlasInsights } from "./lib/engines/atlasEngine";
import { buildTransformationSnapshot } from "./lib/engines/transformationEngine";

import { AppLayout } from "./components/Common/AppLayout";
import { DateStrip } from "./components/Common/DateStrip";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Train } from "./components/Workout/Train";
import { Meals } from "./components/Meals/Meals";
import { Progress } from "./components/Progress/Progress";
import { Coach } from "./components/Coach/Coach";
import { Onboarding } from "./components/Onboarding";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [profileComplete, setProfileComplete] = useState(() =>
    saved("gc.profileComplete", false)
  );
  const [onboardingError, setOnboardingError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [profile, setProfile] = useState<Profile>(() =>
    saved("gc.profile", createEmptyProfile())
  );

  const [logs, setLogs] = useState<Record<string, DailyLog>>(() =>
    saved("gc.dailyLogs", {})
  );

  const dayLog = logs[selectedDate] || createEmptyDay(selectedDate);

  function updateDay(patch: Partial<DailyLog>) {
    setLogs({
      ...logs,
      [selectedDate]: {
        ...createEmptyDay(selectedDate),
        ...dayLog,
        ...patch,
      },
    });
  }

  useEffect(() => {
    save("gc.profile", profile);
  }, [profile]);

  useEffect(() => {
    save("gc.profileComplete", profileComplete);
  }, [profileComplete]);

  useEffect(() => {
    save("gc.dailyLogs", logs);
  }, [logs]);

  const totalExercises = workouts.reduce(
    (sum, workout) => sum + workout.exercises.length,
    0
  );

  const workoutCompletion = calculateWorkoutCompletion(dayLog, totalExercises);

  const transformationScore = useMemo(
    () => calculateTransformationScore(dayLog, workoutCompletion),
    [dayLog, workoutCompletion]
  );

  const todayWorkout = workouts[new Date(selectedDate + "T00:00:00").getDay() % workouts.length];

  const missionHistory = useMemo(() => {
    const dates = Array.from(new Set([...getLastSevenDays(), selectedDate, ...Object.keys(logs)])).sort();

    return dates.map((date) => {
      const log = logs[date] || createEmptyDay(date);
      const workout = workouts[new Date(date + "T00:00:00").getDay() % workouts.length];

      return buildDailyMission({ dayLog: log, todayWorkout: workout, totalExercises });
    });
  }, [logs, selectedDate, totalExercises]);

  const mission = useMemo(
    () => buildDailyMission({ dayLog, todayWorkout, totalExercises }),
    [dayLog, todayWorkout, totalExercises]
  );

  const xp = useMemo(() => buildXpSnapshot(logs, missionHistory), [logs, missionHistory]);
  const streak = useMemo(() => buildStreakSnapshot(logs, totalExercises, selectedDate), [logs, selectedDate, totalExercises]);
  const achievements = useMemo(() => buildAchievements(missionHistory, streak), [missionHistory, streak]);
  const nextAchievement = getNextAchievement(achievements);
  const transformation = useMemo(() => buildTransformationSnapshot({
    logs,
    startDate: profile.startDate || selectedDate,
    currentDate: selectedDate,
    totalExercises,
    score: transformationScore,
    mission,
    xp,
    streak,
  }), [logs, mission, profile.startDate, selectedDate, streak, totalExercises, transformationScore, xp]);

  const atlasInsights = buildAtlasInsights(mission, xp, streak, nextAchievement, transformation);

  const weeklyCompletion = useMemo(() => {
    const dates = getLastSevenDays();

    const total = dates.reduce((sum, date) => {
      const log = logs[date] || createEmptyDay(date);
      return sum + calculateWorkoutCompletion(log, totalExercises);
    }, 0);

    return Math.round(total / dates.length);
  }, [logs, totalExercises]);

  if (!profileComplete) {
    return (
      <Onboarding
        profile={profile}
        error={onboardingError}
        saving={savingProfile}
        onChange={(nextProfile) => {
          setOnboardingError("");
          setProfile(nextProfile);
        }}
        onSubmit={() => {
          if (!profile.name.trim() || !profile.goal.trim()) {
            setOnboardingError("Add your name and primary goal to personalize Mission Control.");
            return;
          }

          setSavingProfile(true);
          window.setTimeout(() => {
            setProfileComplete(true);
            setSavingProfile(false);
          }, 350);
        }}
      />
    );
  }

  return (
    <AppLayout profile={profile} page={page} setPage={setPage}>
      <DateStrip
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        logs={logs}
      />

      {page === "home" && (
        <Dashboard
          profile={profile}
          dayLog={dayLog}
          score={transformationScore}
          workoutCompletion={workoutCompletion}
          weeklyCompletion={weeklyCompletion}
          todayWorkout={todayWorkout}
          logs={logs}
          mission={mission}
          xp={xp}
          streak={streak}
          nextAchievement={nextAchievement}
          atlasInsights={atlasInsights}
          transformation={transformation}
          setPage={setPage}
        />
      )}

      {page === "train" && <Train dayLog={dayLog} updateDay={updateDay} />}

      {page === "meals" && <Meals dayLog={dayLog} updateDay={updateDay} />}

      {page === "progress" && (
        <Progress
          logs={logs}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dayLog={dayLog}
          updateDay={updateDay}
          transformation={transformation}
        />
      )}

      {page === "coach" && <Coach profile={profile} dayLog={dayLog} mission={mission} xp={xp} streak={streak} nextAchievement={nextAchievement} atlasInsights={atlasInsights} />}

    </AppLayout>
  );
}
