import { LESSONS } from '@/data/routes';

import { dayKey, daysBetween, faltamParaSubir, isLessonUnlocked, nextStreak, nivelDe, visibleStreak } from '../progress';

describe('datas', () => {
  it('dayKey usa a data local', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('daysBetween atravessa meses e anos', () => {
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
    expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
    expect(daysBetween('2026-03-01', '2026-03-01')).toBe(0);
  });
});

describe('sequência de dias', () => {
  it('começa em 1', () => expect(nextStreak(0, null, '2026-05-10')).toBe(1));
  it('não soma duas vezes no mesmo dia', () => expect(nextStreak(4, '2026-05-10', '2026-05-10')).toBe(4));
  it('soma no dia seguinte', () => expect(nextStreak(4, '2026-05-09', '2026-05-10')).toBe(5));
  it('zera se pulou um dia', () => expect(nextStreak(4, '2026-05-07', '2026-05-10')).toBe(1));

  it('mostra a sequência até o fim do dia seguinte', () => {
    expect(visibleStreak(3, '2026-05-09', '2026-05-10')).toBe(3);
    expect(visibleStreak(3, '2026-05-08', '2026-05-10')).toBe(0);
    expect(visibleStreak(0, null, '2026-05-10')).toBe(0);
  });
});

describe('desbloqueio', () => {
  const byRoute = (route: string) => LESSONS.filter((l) => l.route === route);

  it('a primeira etapa de toda rota começa liberada', () => {
    for (const route of new Set(LESSONS.map((l) => l.route))) {
      const [first, second] = byRoute(route);
      expect(isLessonUnlocked(first.id, {})).toBe(true);
      expect(isLessonUnlocked(second.id, {})).toBe(false);
    }
  });

  it('concluir uma etapa libera só a próxima da mesma rota', () => {
    const [a, b, c] = byRoute(LESSONS[0].route);
    const done = { [a.id]: {} };
    expect(isLessonUnlocked(b.id, done)).toBe(true);
    expect(isLessonUnlocked(c.id, done)).toBe(false);
  });

  it('etapa inexistente fica bloqueada', () => {
    expect(isLessonUnlocked('nao-existe', {})).toBe(false);
  });
});

describe('nível do jogador', () => {
  it('sobe com as etapas concluídas', () => {
    expect(nivelDe(0)).toBe(1);
    expect(nivelDe(3)).toBe(1);
    expect(nivelDe(4)).toBe(2);
    expect(nivelDe(8)).toBe(3);
    expect(nivelDe(22)).toBe(5);
    expect(nivelDe(99)).toBe(5);
  });

  it('diz quanto falta para subir', () => {
    expect(faltamParaSubir(0)).toBe(4);
    expect(faltamParaSubir(5)).toBe(3);
    expect(faltamParaSubir(30)).toBeNull();
  });
});
