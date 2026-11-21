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

/** Etapas concluídas necessárias para chegar a cada nível (nível 1 = começo). */
export const NIVEIS = [0, 4, 8, 14, 22] as const;
export const NIVEL_MAX = NIVEIS.length;

/** Nível do jogador pelo total de etapas concluídas. */
export function nivelDe(concluidas: number): number {
  let n = 1;
  NIVEIS.forEach((minimo, i) => {
    if (concluidas >= minimo) n = i + 1;
  });
  return n;
}

/** Quantas etapas faltam para o próximo nível (null no nível máximo). */
export function faltamParaSubir(concluidas: number): number | null {
  const n = nivelDe(concluidas);
  return n >= NIVEL_MAX ? null : NIVEIS[n] - concluidas;
}

/**
 * Modo teste: marca como concluídas todas as etapas menos os desafios finais de cada rota.
 * Resultado: nível máximo e a última etapa de toda rota liberada.
 */
export function etapasDeTeste(): Record<string, { stars: number; bestAccuracy: number; plays: number }> {
  return Object.fromEntries(
    LESSONS.filter((l) => l.level !== 'challenge').map((l) => [l.id, { stars: 2, bestAccuracy: 0.8, plays: 1 }]),
  );
}
