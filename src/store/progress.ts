import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { dayKey, etapasDeTeste, nextStreak, nivelDe } from '@/game/progress';
import { starsFor } from '@/game/questions';

export const DAILY_GOAL_KM = 50;

/** Armazenamento que nunca quebra o app: se o aparelho/navegador bloquear, só não salva. */
const safeStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {}
  },
  removeItem: async (name) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {}
  },
};

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
  /** efeitos sonoros de acerto/erro ligados */
  som: boolean;
  /** progresso real guardado enquanto o modo teste está ligado (null = modo teste desligado) */
  backupTeste: Omit<ProgressData, 'som' | 'backupTeste'> | null;
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
  /** nível antes e depois da etapa (sobe com as etapas concluídas) */
  nivelAntes: number;
  nivelDepois: number;
};

type ProgressState = ProgressData & {
  finishLesson: (result: LessonResult) => LessonSummary;
  alternarSom: () => void;
  /** guarda o progresso real e libera os desafios finais no nível máximo */
  entrarModoTeste: () => void;
  /** volta ao progresso guardado */
  sairModoTeste: () => void;
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
  som: true,
  backupTeste: null,
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
        const nivelAntes = nivelDe(Object.keys(state.lessons).length);
        const nivelDepois = nivelDe(Object.keys(state.lessons).length + (prev ? 0 : 1));
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

        return { stars, newCars, streak, streakUp, nivelAntes, nivelDepois };
      },

      alternarSom: () => set({ som: !get().som }),

      entrarModoTeste: () => {
        const { km, streak, bestStreak, lastPlayed, lessons, garage, answered, correct, todayKm, backupTeste } = get();
        set({
          backupTeste: backupTeste ?? { km, streak, bestStreak, lastPlayed, lessons, garage, answered, correct, todayKm },
          lessons: { ...lessons, ...etapasDeTeste() },
        });
      },

      sairModoTeste: () => {
        const { backupTeste } = get();
        if (backupTeste) set({ ...backupTeste, backupTeste: null });
      },

      reset: () => set({ ...initial, som: get().som }),
    }),
    {
      name: 'progress-v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ finishLesson, alternarSom, entrarModoTeste, sairModoTeste, reset, ...data }) => data,
    },
  ),
);

export function todayKmOf(todayKm: ProgressData['todayKm']): number {
  return todayKm.day === dayKey() ? todayKm.km : 0;
}
