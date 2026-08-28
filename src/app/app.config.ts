import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withViewTransitions,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { UpdateService } from './core/update.service';

// App monolingue : les pipes ne doivent pas dépendre de la locale du navigateur.
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // Pas de provideHttpClient : rien n'a besoin du réseauet le fournir « au cas
    // où » coûterait 5 ko gzip pour du code jamais appelé. Le README décrit les
    // trois changements à faire le jour où une donnée devra être rafraîchie.
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true }),
      // Toutes les routes sont chargées à la demande et l'app n'a ni garde ni
      // résolveur : une erreur de navigation ne peut venir que d'un morceau de
      // code introuvable, donc d'un cache du service worker incomplet.
      withNavigationErrorHandler(() => inject(UpdateService).reportBrokenCache()),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
