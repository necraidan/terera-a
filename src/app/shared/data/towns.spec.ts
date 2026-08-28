import { describe, expect, it } from 'vitest';
import { haversineKm } from './geo';
import { ISLANDS } from './islands.data';
import { TOWNS } from './towns.data';

describe('TOWNS', () => {
  it('rattache chaque localité à une île connue, à moins de 60 km de son point', () => {
    for (const town of TOWNS) {
      const island = ISLANDS.find((i) => i.id === town.islandId);
      expect(island, town.name).toBeDefined();
      expect(haversineKm(town, island!), town.name).toBeLessThan(60);
    }
  });

  it('donne un chef-lieu (rang 1) à chaque île qui a des localités', () => {
    const islandIds = new Set(TOWNS.map((t) => t.islandId));
    for (const id of islandIds) {
      expect(
        TOWNS.some((t) => t.islandId === id && t.rank === 1),
        id,
      ).toBe(true);
    }
  });
});
