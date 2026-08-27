/**
 * L'application est zoneless : `zone.js` n'est ni une dépendance ni un polyfill.
 *
 * Le harness de test généré par `@angular/build:unit-test` contient malgré tout
 * un `await import('zone.js/testing')` gardé par `typeof Zone !== 'undefined'`.
 * Le garde empêche l'exécution, mais Vite doit quand même résoudre le module à
 * l'analyse. Cet alias lui donne une cible vide (voir `vitest-base.config.ts`).
 */
export {};
