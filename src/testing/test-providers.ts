import { EnvironmentProviders, Provider, provideZonelessChangeDetection } from '@angular/core';

/**
 * Providers injectés dans le TestBed par `@angular/build:unit-test`.
 *
 * L'application tourne en zoneless : les tests doivent utiliser la même
 * stratégie de détection de changement, sans quoi ils vérifieraient un
 * comportement que la production n'a pas.
 */
const providers: (Provider | EnvironmentProviders)[] = [provideZonelessChangeDetection()];

export default providers;
