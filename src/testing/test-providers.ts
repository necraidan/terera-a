import { EnvironmentProviders, Provider, provideZonelessChangeDetection } from '@angular/core';

/**
 * Providers du TestBed. L'app tourne en zoneless : sans ce provider, les tests
 * vérifieraient un comportement que la production n'a pas.
 */
const providers: (Provider | EnvironmentProviders)[] = [provideZonelessChangeDetection()];

export default providers;
