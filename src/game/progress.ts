import { LESSONS } from '@/data/routes';

/** Data local no formato AAAA-MM-DD. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Diferença em dias entre duas chaves AAAA-MM-DD (b - a). */
export function daysBetween(a: string, b: string): number {
  const toUtc = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

/** Sequência de dias depois de jogar hoje. */
export function nextStreak(streak: number, lastPlayed: string | null, today: string): number {
  if (!lastPlayed) return 1;
  const gap = daysBetween(lastPlayed, today);
  if (gap <= 0) return Math.max(1, streak);
  if (gap === 1) return streak + 1;
  return 1;
}

/** Sequência que deve aparecer na tela (zera se o jogador pulou um dia). */
export function visibleStreak(streak: number, lastPlayed: string | null, today: string): number {
  if (!lastPlayed) return 0;
  return daysBetween(lastPlayed, today) <= 1 ? streak : 0;
}

/**
 * Todas as rotas começam liberadas; dentro de cada rota, uma etapa libera a próxima.
 */
export function isLessonUnlocked(lessonId: string, completed: Record<string, unknown>): boolean {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return false;
  const routeLessons = LESSONS.filter((l) => l.route === lesson.route);
  const index = routeLessons.indexOf(lesson);
  return index === 0 || routeLessons[index - 1].id in completed;
}
