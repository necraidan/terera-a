import { APP_VERSION } from '../../core/version';
import { CHANGELOG } from './changelog.data';

/** `1.2.3` → `[1, 2, 3]`, ou `null` si ce n'est pas un semver simple. */
function parseSemver(version: string): [number, number, number] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function compare(a: [number, number, number], b: [number, number, number]): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

describe('CHANGELOG', () => {
  it('n’est pas vide', () => {
    expect(CHANGELOG.length).toBeGreaterThan(0);
  });

  it('décrit la version installée en première entrée', () => {
    // Garde-fou du process de release : bumper package.json sans documenter la
    // version (ou l'inverse) casse ici, pas chez l'utilisateur.
    expect(CHANGELOG[0].version).toBe(APP_VERSION);
  });

  it('utilise des versions semver uniques, du plus récent au plus ancien', () => {
    const versions = CHANGELOG.map((entry) => entry.version);
    expect(new Set(versions).size).toBe(versions.length);

    const parsed = versions.map((version) => {
      const semver = parseSemver(version);
      expect(semver, `version invalide : ${version}`).not.toBeNull();
      return semver as [number, number, number];
    });

    for (let i = 1; i < parsed.length; i++) {
      expect(
        compare(parsed[i - 1], parsed[i]),
        `${versions[i - 1]} doit suivre ${versions[i]}`,
      ).toBeGreaterThan(0);
    }
  });

  it('date chaque version au format ISO', () => {
    for (const entry of CHANGELOG) {
      expect(entry.date, entry.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(entry.date).getTime()), entry.date).toBe(false);
    }
  });

  it('décrit au moins un changement par version', () => {
    for (const entry of CHANGELOG) {
      expect(entry.changes.length, entry.version).toBeGreaterThan(0);
    }
  });
});
