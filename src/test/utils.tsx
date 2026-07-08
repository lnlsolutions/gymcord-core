import { vi } from "vitest";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { AppContextProvider } from "../context/AppContext";
import { AuthProvider } from "../auth/AuthProvider";
import type { AuthService, AuthSession } from "../auth/types";
import type { DailyLog, Exercise, Mission, WorkoutDay } from "../types/gymcord";

export function createMockAuthSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    user: {
      id: "user-1",
      email: "member@gymcord.test",
      displayName: "GymCord Member",
      avatarUrl: "",
      roles: ["member"],
      organizationIds: ["org-1"],
      activeOrganizationId: "org-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    tokens: { accessToken: "access", refreshToken: "refresh", tokenType: "Bearer", expiresAt: "2099-01-01T00:00:00.000Z" },
    ...overrides,
  };
}

export function createMockAuthService(session: AuthSession | null = null): AuthService {
  let current = session;
  const listeners = new Set<(session: AuthSession | null) => void>();
  const emit = () => listeners.forEach((listener) => listener(current));
  return {
    getCurrentSession: vi.fn(async () => current),
    signIn: vi.fn(async () => { current = createMockAuthSession(); emit(); return current; }),
    signUp: vi.fn(async () => { current = createMockAuthSession(); emit(); return current; }),
    requestPasswordReset: vi.fn(async () => undefined),
    refreshSession: vi.fn(async (nextSession) => nextSession),
    signOut: vi.fn(async () => { current = null; emit(); }),
    onAuthStateChanged: vi.fn((listener) => { listeners.add(listener); return () => listeners.delete(listener); }),
  };
}

export function createExercise(overrides: Partial<Exercise> = {}): Exercise {
  return { id: "squat", name: "Squat", prescription: "4 sets × 8 reps", description: "Train legs", cues: [], muscles: ["legs"], difficulty: "Beginner", equipment: "Barbell", image: "", ...overrides };
}

export function createWorkoutDay(overrides: Partial<WorkoutDay> = {}): WorkoutDay {
  return { id: "day-1", day: "Monday", title: "Lower Body", focus: "Strength", duration: 45, image: "", exercises: [createExercise()], ...overrides };
}

export function createDailyLog(overrides: Partial<DailyLog> = {}): DailyLog {
  return { date: "2026-01-01", completedExercises: {}, weights: {}, notes: {}, protein: 0, calories: 0, water: 0, sleep: 0, steps: 0, mood: 3, energy: 3, ingredients: "", mealPhoto: "", measurements: { weight: "", waist: "", hips: "", glutes: "", thighs: "", arms: "", chest: "" }, photos: { front: "", side: "", back: "" }, ...overrides };
}

export function createMission(overrides: Partial<Mission> = {}): Mission {
  return { id: "mission-1", date: "2026-01-01", title: "Daily Mission", description: "", xpReward: 100, earnedXp: 50, completed: false, progress: 1, target: 2, completionPercentage: 50, tasks: [], ...overrides };
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions & { authService?: AuthService }) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <AppContextProvider><AuthProvider service={options?.authService}>{children}</AuthProvider></AppContextProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
