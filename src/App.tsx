import { useEffect, useMemo, useRef, useState } from "react";
import { appConfig } from "./config";
import { AppContextProvider } from "./context/AppContext";
import { AuthProvider, ForgotPasswordScreen, LoadingScreen, LoginScreen, ProtectedRoute, SignupScreen, useAuth } from "./auth";
import type { AtlasConversationEntry, DailyLog, Page, Profile } from "./types/gymcord";

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
import { buildAtlasMemory } from "./lib/engines/memoryEngine";
import { buildAtlasContext } from "./lib/engines/contextEngine";
import { buildTransformationSnapshot } from "./lib/engines/transformationEngine";

import { AppLayout } from "./components/Common/AppLayout";
import { DateStrip } from "./components/Common/DateStrip";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Train } from "./components/Workout/Train";
import { Meals } from "./components/Meals/Meals";
import { Progress } from "./components/Progress/Progress";
import { Coach } from "./components/Coach/Coach";
import { Onboarding } from "./components/Onboarding";
import { OrganizationSettings } from "./components/Settings/OrganizationSettings";
import { organizationService } from "./services/OrganizationService";
import { TenantContext } from "./lib/tenant";
import { EventTypes } from "./core/events";
import { notificationEngine } from "./core/automation";
import { realtimeService } from "./services/realtime";
import { DeveloperEvents } from "./components/Dev/DeveloperEvents";
import { DeveloperAnalytics } from "./components/Dev/DeveloperAnalytics";
import { DeveloperDataFlow } from "./components/Dev/DeveloperDataFlow";
import { DeveloperOnboardingFlow } from "./components/Dev/DeveloperOnboardingFlow";
import { DeveloperPersistence } from "./components/Dev/DeveloperPersistence";
import { DeveloperDashboard } from "./components/Dev/DeveloperDashboard";
import { DeveloperWorkout } from "./components/Dev/DeveloperWorkout";
import { DeveloperNutrition } from "./components/Dev/DeveloperNutrition";
import { DeveloperAtlas } from "./components/Dev/DeveloperAtlas";
import { TrainerOS } from "./components/Trainer/TrainerOS";
import { TrainerDashboard } from "./components/trainer/TrainerDashboard";
import { DeveloperTrainer } from "./components/Dev/DeveloperTrainer";
import { dashboardRepository } from "./repositories/DashboardRepository";
import { nutritionRepository } from "./repositories/NutritionRepository";
import { progressExperienceRepository } from "./repositories/ProgressExperienceRepository";
import { atlasCoachRepository } from "./repositories/AtlasCoachRepository";
import { onboardingRepository } from "./services/OnboardingRepository";
import { telemetryService, AnalyticsEventNames } from "./core/analytics";

function GymCordApp() {
  const auth = useAuth();
  const [page, setPage] = useState<Page>("home");
  const [tenant, setTenant] = useState<TenantContext | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [profileComplete, setProfileComplete] = useState(() =>
    saved(appConfig.storageKeys.profileComplete, false)
  );
  const [onboardingError, setOnboardingError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const previousMissionComplete = useRef(false);
  const previousTotalXp = useRef(0);
  const unlockedAchievementIds = useRef(new Set<string>());
  const previousAtlasSignal = useRef("");
  const persistenceHydrated = useRef(false);

  useEffect(() => {
    void telemetryService.initialize();
    notificationEngine.start();
    return () => notificationEngine.stop();
  }, []);

  const [profile, setProfile] = useState<Profile>(() =>
    saved(appConfig.storageKeys.profile, createEmptyProfile())
  );

  const [logs, setLogs] = useState<Record<string, DailyLog>>(() =>
    saved(appConfig.storageKeys.dailyLogs, {})
  );

  const [conversation, setConversation] = useState<AtlasConversationEntry[]>(() =>
    atlasCoachRepository.loadCachedConversation()
  );

  const dayLog = logs[selectedDate] || createEmptyDay(selectedDate);

  useEffect(() => {
    void realtimeService.connect();

    const unsubscribe = realtimeService.subscribe("*", (event) => {
      const startedAt = performance.now();
      const analyticsEventName = event.type === EventTypes.TrainerAssigned ? AnalyticsEventNames.TrainerAdded : event.type === EventTypes.MemberJoined ? AnalyticsEventNames.MemberJoined : event.type;
      telemetryService.track(analyticsEventName, { eventId: event.id, source: event.source }, "realtime-service");
      telemetryService.performance.trackEventProcessing(event.type, performance.now() - startedAt);
      if (appConfig.environment === "development") {
        console.debug("[GymCord Realtime] event received", event);
      }
    });

    void organizationService.bootstrap().then((nextTenant) => {
      const activeOrg = auth.session?.organization;
      if (activeOrg) {
        setTenant(new TenantContext({ ...nextTenant.organization, id: activeOrg.id, name: activeOrg.name, slug: activeOrg.slug }, nextTenant.role));
      } else {
        setTenant(nextTenant);
      }
    });

    return () => {
      unsubscribe();
      void realtimeService.disconnect();
    };
  }, []);

  function getUpdatedDay(patch: Partial<DailyLog>) {
    return {
      ...createEmptyDay(selectedDate),
      ...dayLog,
      ...patch,
    };
  }

  function updateDay(patch: Partial<DailyLog>) {
    setLogs({
      ...logs,
      [selectedDate]: getUpdatedDay(patch),
    });
  }

  useEffect(() => {
    save(appConfig.storageKeys.profile, profile);
    if (persistenceHydrated.current) void dashboardRepository.saveProfile(auth.session, profile);
  }, [auth.session, profile]);

  useEffect(() => {
    save(appConfig.storageKeys.profileComplete, profileComplete);
  }, [profileComplete]);

  useEffect(() => {
    save(appConfig.storageKeys.dailyLogs, logs);
  }, [logs]);


  useEffect(() => {
    let active = true;
    dashboardRepository.load(auth.session)
      .then((state) => {
        if (!active) return;
        setProfile(state.profile);
        setLogs(state.logs);
        void atlasCoachRepository.loadConversation(auth.session).then(setConversation);
        persistenceHydrated.current = true;
      })
      .catch((error: Error) => {
        console.warn(`[GymCord Persistence] startup load skipped: ${error.message}`);
        persistenceHydrated.current = true;
      });
    return () => { active = false; };
  }, [auth.session]);


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

  useEffect(() => {
    if (!persistenceHydrated.current) return;
    void dashboardRepository.saveDailyLog(auth.session, dayLog, mission, xp, streak);
  }, [auth.session, dayLog, mission, streak, xp]);

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

  const atlasMemory = useMemo(() => buildAtlasMemory({ profile, logs, mission, nextAchievement }), [logs, mission, nextAchievement, profile]);
  const atlasInsights = useMemo(() => buildAtlasInsights(mission, xp, streak, nextAchievement, transformation), [mission, nextAchievement, streak, transformation, xp]);

  useEffect(() => {
    void atlasCoachRepository.saveMemory(auth.session, atlasMemory, atlasInsights[0]?.message);
  }, [auth.session, atlasInsights, atlasMemory]);

  const atlasContext = useMemo(() => buildAtlasContext({ memory: atlasMemory, dayLog, mission, streak, todayWorkout, transformation }), [atlasMemory, dayLog, mission, streak, todayWorkout, transformation]);

  useEffect(() => {
    if (!previousMissionComplete.current && mission.completed) {
      telemetryService.track(AnalyticsEventNames.MissionCompleted, { missionId: mission.id, completionPercentage: mission.completionPercentage }, "mission-engine");
      void realtimeService.publish(EventTypes.MissionCompleted, { mission, completedAt: new Date().toISOString() }, "mission-engine");
    }
    previousMissionComplete.current = mission.completed;
  }, [mission]);

  useEffect(() => {
    if (previousTotalXp.current > 0 && xp.totalXp > previousTotalXp.current) {
      telemetryService.track(AnalyticsEventNames.XpEarned, { amount: xp.totalXp - previousTotalXp.current, totalXp: xp.totalXp }, "xp-engine");
      void realtimeService.publish(EventTypes.XpEarned, {
        amount: xp.totalXp - previousTotalXp.current,
        totalXp: xp.totalXp,
        snapshot: xp,
        reason: "xp-engine-recalculation",
      }, "xp-engine");
    }
    previousTotalXp.current = xp.totalXp;
  }, [xp]);

  useEffect(() => {
    achievements.filter((achievement) => achievement.unlocked).forEach((achievement) => {
      if (unlockedAchievementIds.current.has(achievement.id)) return;
      unlockedAchievementIds.current.add(achievement.id);
      telemetryService.track(AnalyticsEventNames.AchievementUnlocked, { achievementId: achievement.id, title: achievement.title }, "achievement-engine");
      void realtimeService.publish(EventTypes.AchievementUnlocked, { achievement, unlockedAt: new Date().toISOString() }, "achievement-engine");
    });
  }, [achievements]);

  useEffect(() => {
    const atlasSignal = `${mission.id}:${mission.completionPercentage}:${atlasInsights.map((insight) => insight.message).join("|")}`;
    if (previousAtlasSignal.current && previousAtlasSignal.current !== atlasSignal) {
      void realtimeService.publish(EventTypes.AtlasUpdated, { insights: atlasInsights, mission, updatedAt: new Date().toISOString() }, "atlas-engine");
      void realtimeService.publish(EventTypes.AtlasInsightGenerated, { insights: atlasInsights, generatedAt: new Date().toISOString() }, "atlas-engine");
    }
    previousAtlasSignal.current = atlasSignal;
  }, [atlasInsights, mission]);

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
      <AppContextProvider>
        <Onboarding
        profile={profile}
        error={onboardingError}
        saving={savingProfile}
        onChange={(nextProfile) => {
          setOnboardingError("");
          setProfile(nextProfile);
          void realtimeService.publish(EventTypes.MemberUpdated, { profile: nextProfile, updatedAt: new Date().toISOString() }, "member-engine");
        }}
        onSubmit={() => {
          if (!profile.name.trim() || !profile.goal.trim()) {
            setOnboardingError("Add your name and primary goal to personalize Mission Control.");
            return;
          }

          setSavingProfile(true);
          void onboardingRepository.save(auth.session, profile, dayLog)
            .then(() => {
              window.setTimeout(() => {
                setProfileComplete(true);
                setSavingProfile(false);
              }, appConfig.onboarding.completionDelayMs);
            })
            .catch((error: Error) => {
              setOnboardingError(error.message);
              setSavingProfile(false);
            });
        }}
      />
      </AppContextProvider>
    );
  }

  return (
    <AppContextProvider>
    <AppLayout profile={profile} organization={tenant?.organization} page={page} setPage={setPage}>
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

      {page === "train" && <Train dayLog={dayLog} updateDay={updateDay} mission={mission} xp={xp} achievements={achievements} onWorkoutStarted={(workout) => {
        telemetryService.track(AnalyticsEventNames.WorkoutStarted, { workoutId: workout.id, title: workout.title }, "workout-engine");
      }} onWorkoutCompleted={({ workout, dayLog: completedDayLog, durationMinutes, xpEarned }) => {
        telemetryService.track(AnalyticsEventNames.WorkoutCompleted, { workoutId: workout.id, title: workout.title, durationMinutes, xpEarned }, "workout-engine");
        void realtimeService.publish(EventTypes.WorkoutCompleted, {
          workout,
          dayLog: completedDayLog,
          completedAt: new Date().toISOString(),
          durationMinutes,
          xpEarned,
        }, "workout-engine");
      }} />}

      {page === "meals" && <Meals dayLog={dayLog} updateDay={(patch) => {
        const nextLog = getUpdatedDay(patch);
        updateDay(patch);
        telemetryService.track(AnalyticsEventNames.MealLogged, { fields: Object.keys(patch) }, "meal-engine");
        void nutritionRepository.saveNutritionLog(auth.session, nextLog, mission, xp, streak);
      }} />}

      {page === "progress" && (
        <Progress
          logs={logs}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dayLog={dayLog}
          updateDay={(patch) => {
            const nextLog = getUpdatedDay(patch);
            updateDay(patch);
            if (patch.photos) telemetryService.track(AnalyticsEventNames.ProgressPhotoAdded, { date: selectedDate }, "progress-engine");
            void progressExperienceRepository.saveProgressLog(auth.session, nextLog, mission, xp, streak);
          }}
          transformation={transformation}
        />
      )}

      {page === "coach" && <Coach profile={profile} dayLog={dayLog} mission={mission} xp={xp} streak={streak} nextAchievement={nextAchievement} atlasInsights={atlasInsights} atlasMemory={atlasMemory} atlasContext={atlasContext} conversation={conversation} onRememberConversation={(entry) => {
        const nextConversation = [entry, ...conversation];
        setConversation(nextConversation);
        void atlasCoachRepository.rememberConversation(auth.session, entry, nextConversation);
        telemetryService.track(AnalyticsEventNames.AtlasConversation, { conversationId: profile.id, messageLength: entry.question.length }, "atlas-conversation-engine");
        void realtimeService.publish(EventTypes.MessageReceived, {
          id: entry.id,
          conversationId: profile.id,
          senderId: profile.id,
          message: entry.question,
          receivedAt: entry.timestamp,
        }, "atlas-conversation-engine");
        void realtimeService.publish(EventTypes.NotificationCreated, {
          id: `atlas-${entry.id}`,
          title: "Atlas response ready",
          body: entry.answer,
          createdAt: entry.timestamp,
        }, "notification-engine");
      }} />}

      {page === "settings" && tenant && (
        <OrganizationSettings
          organization={tenant.organization}
          role={tenant.role}
          onChange={(organization) => {
            void organizationService.updateOrganization(organization).then((updated) => {
              setTenant(new TenantContext(updated, tenant.role));
              telemetryService.track(AnalyticsEventNames.OrganizationCreated, { organizationId: updated.id, name: updated.name }, "organization-engine");
              void realtimeService.publish(EventTypes.OrganizationUpdated, { organization: updated, updatedAt: new Date().toISOString() }, "organization-engine");
            });
          }}
        />
      )}

    </AppLayout>
    </AppContextProvider>
  );
}


function AuthGate() {
  const auth = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");

  if (auth.status === "loading") return <LoadingScreen />;
  if (!auth.isAuthenticated && mode === "signup") return <SignupScreen onModeChange={setMode} />;
  if (!auth.isAuthenticated && mode === "forgot") return <ForgotPasswordScreen onModeChange={setMode} />;
  if (!auth.isAuthenticated) return <LoginScreen onModeChange={setMode} />;

  return (
    <ProtectedRoute permissions={["dashboard:view"]}>
      <GymCordApp />
    </ProtectedRoute>
  );
}

export default function App() {
  if (window.location.pathname === "/dev/analytics") {
    void telemetryService.initialize();
    return <DeveloperAnalytics />;
  }

  if (window.location.pathname === "/dev/events") {
    notificationEngine.start();
    return <DeveloperEvents />;
  }

  if (window.location.pathname === "/dev/data-flow") {
    return (
      <AuthProvider>
        <DeveloperDataFlow />
      </AuthProvider>
    );
  }

  if (window.location.pathname === "/dev/onboarding-flow") {
    return (
      <AuthProvider>
        <DeveloperOnboardingFlow />
      </AuthProvider>
    );
  }

  if (window.location.pathname === "/trainer") {
    return (
      <AuthProvider>
        <TrainerDashboard />
      </AuthProvider>
    );
  }

  if (window.location.pathname === "/dev/trainer") {
    return (
      <AuthProvider>
        <DeveloperTrainer />
      </AuthProvider>
    );
  }

  if (window.location.pathname === "/dev/trainer-os") {
    return (
      <AuthProvider>
        <TrainerOS developer />
      </AuthProvider>
    );
  }

  if (window.location.pathname === "/dev/persistence" || window.location.pathname === "/dev/progress") {
    return (
      <AuthProvider>
        <DeveloperPersistence />
      </AuthProvider>
    );
  }

  if (window.location.pathname === "/dev/dashboard") {
    return (
      <AuthProvider>
        <DeveloperDashboard />
      </AuthProvider>
    );
  }

  if (window.location.pathname === "/dev/workout") {
    return (
      <AuthProvider>
        <DeveloperWorkout />
      </AuthProvider>
    );
  }

  if (window.location.pathname === "/dev/atlas") {
    return (
      <AuthProvider>
        <DeveloperAtlas />
      </AuthProvider>
    );
  }

  if (window.location.pathname === "/dev/nutrition") {
    return (
      <AuthProvider>
        <DeveloperNutrition />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
