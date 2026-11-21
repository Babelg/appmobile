import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { dayKey, nextStreak } from '@/game/progress';
import { starsFor } from '@/game/questions';

export const DAILY_GOAL_KM = 50;

type LessonRecord = { stars: number; bestAccuracy: number; plays: number };
type CarRecord = { collectedAt: string };

type ProgressData = {
  km: number;
  streak: number;
  bestStreak: number;
  lastPlayed: string | null;
  lessons: Record<string, LessonRecord>;
  garage: Record<string, CarRecord>;
  answered: number;
  correct: number;
  todayKm: { day: string; km: number };
};

export type LessonResult = {
  lessonId: string;
  km: number;
  answered: number;
  correct: number;
  /** Carros acertados em perguntas de "que carro é esse?". */
  identified: string[];
};

export type LessonSummary = {
  stars: 1 | 2 | 3;
  newCars: string[];
  streak: number;
  streakUp: boolean;
};

type ProgressState = ProgressData & {
  finishLesson: (result: LessonResult) => LessonSummary;
  reset: () => void;
};

const initial: ProgressData = {
  km: 0,
  streak: 0,
  bestStreak: 0,
  lastPlayed: null,
  lessons: {},
  garage: {},
  answered: 0,
  correct: 0,
  todayKm: { day: '', km: 0 },
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      finishLesson: (result) => {
        const state = get();
        const today = dayKey();
        const accuracy = result.answered ? result.correct / result.answered : 0;
        const stars = starsFor(accuracy);
        const streak = nextStreak(state.streak, state.lastPlayed, today);
        const streakUp = state.lastPlayed !== today;

        const prev = state.lessons[result.lessonId];
        const newCars = result.identified.filter((id) => !(id in state.garage));
        const garage = { ...state.garage };
        for (const id of newCars) garage[id] = { collectedAt: today };

        set({
          km: state.km + result.km,
          streak,
          bestStreak: Math.max(state.bestStreak, streak),
          lastPlayed: today,
          garage,
          answered: state.answered + result.answered,
          correct: state.correct + result.correct,
          todayKm: {
            day: today,
            km: (state.todayKm.day === today ? state.todayKm.km : 0) + result.km,
          },
          lessons: {
            ...state.lessons,
            [result.lessonId]: {
              stars: Math.max(prev?.stars ?? 0, stars),
              bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
              plays: (prev?.plays ?? 0) + 1,
            },
          },
        });

        return { stars, newCars, streak, streakUp };
      },

      reset: () => set({ ...initial }),
    }),
    {
      name: 'progress-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ finishLesson, reset, ...data }) => data,
    },
  ),
);

export function todayKmOf(todayKm: ProgressData['todayKm']): number {
  return todayKm.day === dayKey() ? todayKm.km : 0;
}
