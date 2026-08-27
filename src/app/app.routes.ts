import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Terera’a — boîte à outils Polynésie',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'convertisseur',
    title: 'Euro ↔ Franc pacifique — Terera’a',
    loadComponent: () =>
      import('./features/converter/converter.component').then((m) => m.ConverterComponent),
  },
  {
    path: 'horloge',
    title: 'Heure à Tahiti — Terera’a',
    loadComponent: () => import('./features/clock/clock.component').then((m) => m.ClockComponent),
  },
  {
    path: 'lexique',
    title: 'Lexique tahitien — Terera’a',
    loadComponent: () =>
      import('./features/lexicon/lexicon.component').then((m) => m.LexiconComponent),
  },
  {
    path: 'infos',
    title: 'Infos pratiques — Terera’a',
    loadComponent: () =>
      import('./features/practical/practical.component').then((m) => m.PracticalComponent),
  },
  {
    path: 'infos/:id',
    loadComponent: () =>
      import('./features/practical/practical-detail.component').then(
        (m) => m.PracticalDetailComponent,
      ),
  },
  {
    path: 'reglages',
    title: 'Réglages — Terera’a',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'reglages/changelog',
    title: 'Nouveautés — Terera’a',
    loadComponent: () =>
      import('./features/changelog/changelog.component').then((m) => m.ChangelogComponent),
  },
  {
    path: '**',
    title: 'Page introuvable — Terera’a',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
