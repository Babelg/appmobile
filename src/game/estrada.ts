/**
 * Geometria da estrada sinuosa da tela inicial: as etapas ficam alternando de um lado para o
 * outro e a pista passa por elas em curvas (Bézier cúbicas com tangente vertical em cada parada,
 * então o rótulo ao lado da parada nunca encosta na pista).
 */
export type Lado = 'esquerda' | 'direita';
export type Parada = { x: number; y: number; lado: Lado };
export type Ponto = { x: number; y: number };

export const ESTRADA = {
  /** distância do topo da pista até a primeira parada */
  topo: 92,
  /** distância vertical entre paradas */
  passo: 150,
  /** sobra depois da última parada (a pista volta ao centro e segue para a próxima rota) */
  fim: 104,
  /** largura do asfalto */
  pista: 58,
} as const;

export function geometriaEstrada(largura: number, paradas: number, inverte = false) {
  const cx = largura / 2;
  const amplitude = Math.min(largura * 0.27, 130);
  const pontos: Parada[] = Array.from({ length: paradas }, (_, i) => {
    const sinal = (i % 2 === 0 ? -1 : 1) * (inverte ? -1 : 1);
    return { x: cx + sinal * amplitude, y: ESTRADA.topo + i * ESTRADA.passo, lado: sinal < 0 ? 'esquerda' : 'direita' };
  });
  const altura = ESTRADA.topo + (paradas - 1) * ESTRADA.passo + ESTRADA.fim;
  const trilha: Ponto[] = [{ x: cx, y: 0 }, ...pontos, { x: cx, y: altura }];
  /** um trecho por ligação: entrada → parada 1 → … → última parada → saída */
  const trechos = trilha.slice(1).map((p, i) => {
    const a = trilha[i];
    const dy = p.y - a.y;
    return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${(a.y + dy * 0.55).toFixed(1)} ${p.x.toFixed(1)} ${(p.y - dy * 0.55).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  });
  /** enfeites de beira de estrada, no meio de cada curva, na borda livre */
  const enfeites: (Ponto & { lado: Lado })[] = pontos.slice(0, -1).map((p, i) => ({
    x: p.lado === 'esquerda' ? 14 : largura - 14,
    y: (p.y + pontos[i + 1].y) / 2,
    lado: p.lado,
  }));
  return { cx, amplitude, pontos, altura, trechos, enfeites };
}
