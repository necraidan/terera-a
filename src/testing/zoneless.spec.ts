import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('environnement de test', () => {
  it('ne charge pas zone.js', () => {
    // Le harness généré tente `import('zone.js/testing')` derrière un garde ;
    // cf. zone-testing-stub.ts et l'alias de vitest-base.config.ts.
    expect(typeof (globalThis as Record<string, unknown>)['Zone']).toBe('undefined');
  });

  it('utilise la détection de changement zoneless, comme la production', () => {
    // En zoneless, Angular fournit une NgZone inerte : rien ne patche les APIs du
    // navigateur, et aucun cycle de détection n'est déclenché par les tâches. Si
    // ce test casse, les autres vérifieraient un comportement que la production
    // n'a pas.
    expect(TestBed.inject(NgZone).constructor.name).toBe('NoopNgZone');
  });
});
