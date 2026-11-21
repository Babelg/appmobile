import { CAR_IMAGES } from '@/data/carImages';
import { CARS } from '@/data/cars';
import CREDITS from '@/data/credits.json';
import FIPE from '@/data/fipe.json';
import { LESSONS, ROUTES } from '@/data/routes';

describe('conteúdo', () => {
  it('cada carro está em exatamente uma rota, a mesma do seu campo route', () => {
    for (const car of CARS) {
      const routes = ROUTES.filter((r) => r.carIds.includes(car.id));
      expect(routes.map((r) => r.id)).toEqual([car.route]);
    }
  });

  it('ids de carros são únicos e toda rota aponta para carros existentes', () => {
    const ids = CARS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const route of ROUTES) for (const id of route.carIds) expect(ids).toContain(id);
  });

  it.each(CARS.map((c) => [c.id, c] as const))('%s tem foto, créditos, recortes e curiosidades válidos', (id, car) => {
    expect(CAR_IMAGES[id]).toBeDefined();
    const credit = (CREDITS as Record<string, { author: string; license: string; source: string }>)[id];
    expect(credit?.author).toBeTruthy();
    expect(credit?.license).toBeTruthy();
    expect(credit?.source).toMatch(/^https:\/\/commons\.wikimedia\.org\//);

    expect(car.crops.length).toBeGreaterThanOrEqual(2);
    for (const crop of car.crops) {
      expect(crop.x).toBeGreaterThanOrEqual(0);
      expect(crop.x).toBeLessThanOrEqual(1);
      expect(crop.y).toBeGreaterThanOrEqual(0);
      expect(crop.y).toBeLessThanOrEqual(1);
      expect(crop.zoom).toBeGreaterThanOrEqual(1.5);
      expect(crop.zoom).toBeLessThanOrEqual(4.5);
    }

    expect(car.facts.length).toBeGreaterThanOrEqual(2);
    expect(car.trivia.length).toBeGreaterThanOrEqual(1);
    for (const t of car.trivia) {
      expect(new Set([t.a, ...t.wrong]).size).toBe(4);
    }
  });

  it('valores FIPE apontam para carros existentes, com preço e mês de referência', () => {
    const ids = CARS.map((c) => c.id);
    for (const [id, f] of Object.entries(FIPE)) {
      expect(ids).toContain(id);
      expect(f.price).toMatch(/^R\$ [\d.]+,\d{2}$/);
      expect(f.ref).toMatch(/de \d{4}$/);
      expect(f.year).toBeGreaterThan(1980);
    }
  });

  it('todos os carros das rotas atuais têm FIPE e todos têm combustível', () => {
    for (const car of CARS) {
      expect(car.fuel.length).toBeGreaterThan(2);
      if (car.route === 'populares' || car.route === 'utilitarios') expect(FIPE).toHaveProperty(car.id);
    }
  });

  it('toda rota tem 4 etapas', () => {
    for (const route of ROUTES) expect(LESSONS.filter((l) => l.route === route.id)).toHaveLength(4);
  });
});
