import { ESTRADA, geometriaEstrada } from '../estrada';

describe('estrada sinuosa', () => {
  it.each([320, 358, 528])('largura %i: paradas alternam de lado e cabem na tela', (largura) => {
    const g = geometriaEstrada(largura, 4);
    expect(g.pontos.map((p) => p.lado)).toEqual(['esquerda', 'direita', 'esquerda', 'direita']);
    for (const p of g.pontos) {
      // a parada (72 px) inteira dentro da largura
      expect(p.x - 36).toBeGreaterThanOrEqual(0);
      expect(p.x + 36).toBeLessThanOrEqual(largura);
      // sobra espaço para o rótulo do outro lado
      const livre = p.lado === 'esquerda' ? largura - (p.x + 36) : p.x - 36;
      expect(livre).toBeGreaterThan(largura * 0.35);
    }
  });

  it('inverte o lado inicial', () => {
    expect(geometriaEstrada(358, 4, true).pontos[0].lado).toBe('direita');
  });

  it('a pista entra e sai pelo centro e tem um trecho a mais que as paradas', () => {
    const g = geometriaEstrada(358, 4);
    expect(g.trechos).toHaveLength(5);
    expect(g.trechos[0].startsWith('M 179.0 0.0')).toBe(true);
    expect(g.trechos[4].endsWith(`179.0 ${g.altura.toFixed(1)}`)).toBe(true);
    expect(g.altura).toBe(ESTRADA.topo + 3 * ESTRADA.passo + ESTRADA.fim);
  });

  it('enfeites ficam entre paradas, na borda', () => {
    const g = geometriaEstrada(358, 4);
    expect(g.enfeites).toHaveLength(3);
    for (const e of g.enfeites) expect([14, 344]).toContain(e.x);
  });
});
