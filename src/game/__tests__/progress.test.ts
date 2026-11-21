import { LESSONS } from '@/data/routes';

import { currentLessonId, dayKey, daysBetween, isLessonUnlocked, nextStreak, visibleStreak } from '../progress';

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
  it('só a primeira etapa começa liberada', () => {
    expect(isLessonUnlocked(LESSONS[0].id, {})).toBe(true);
    expect(isLessonUnlocked(LESSONS[1].id, {})).toBe(false);
  });

  it('concluir uma etapa libera a próxima', () => {
    const done = { [LESSONS[0].id]: {} };
    expect(isLessonUnlocked(LESSONS[1].id, done)).toBe(true);
    expect(isLessonUnlocked(LESSONS[2].id, done)).toBe(false);
    expect(currentLessonId(done)).toBe(LESSONS[1].id);
  });

  it('etapa inexistente fica bloqueada', () => {
    expect(isLessonUnlocked('nao-existe', {})).toBe(false);
  });
});
