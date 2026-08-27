import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Terera’a · boîte à outils Polynésie',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'convertisseur',
    title: 'Franc pacifique ↔ Euro · Terera’a',
    loadComponent: () =>
      import('./features/converter/converter.component').then((m) => m.ConverterComponent),
  },
  {
    path: 'horloge',
    title: 'Heure à Tahiti · Terera’a',
    loadComponent: () => import('./features/clock/clock.component').then((m) => m.ClockComponent),
  },
  {
    path: 'especes',
    title: 'Billets et pièces · Terera’a',
    loadComponent: () => import('./features/money/money.component').then((m) => m.MoneyComponent),
  },
  {
    path: 'unites',
    title: 'Convertisseur d’unités · Terera’a',
    loadComponent: () => import('./features/units/units.component').then((m) => m.UnitsComponent),
  },
  {
    path: 'soleil-marees',
    title: 'Soleil et marées · Terera’a',
    loadComponent: () => import('./features/sea/sea.component').then((m) => m.SeaComponent),
  },
  {
    path: 'lexique',
    title: 'Lexique tahitien · Terera’a',
    loadComponent: () =>
      import('./features/lexicon/lexicon.component').then((m) => m.LexiconComponent),
  },
  {
    path: 'carte',
    title: 'Carte et distances · Terera’a',
    loadComponent: () =>
      import('./features/islands/islands.component').then((m) => m.IslandsComponent),
  },
  {
    path: 'faune',
    title: 'Faune marine · Terera’a',
    loadComponent: () =>
      import('./features/wildlife/wildlife.component').then((m) => m.WildlifeComponent),
  },
  {
    path: 'faune/regles',
    title: 'Faune marine, la loi · Terera’a',
    loadComponent: () =>
      import('./features/wildlife/wildlife-rules.component').then((m) => m.WildlifeRulesComponent),
  },
  {
    path: 'faune/:id',
    loadComponent: () =>
      import('./features/wildlife/wildlife-detail.component').then(
        (m) => m.WildlifeDetailComponent,
      ),
  },
  {
    path: 'lexique/prononciation',
    title: 'Prononcer le tahitien · Terera’a',
    loadComponent: () =>
      import('./features/lexicon/pronunciation.component').then((m) => m.PronunciationComponent),
  },
  {
    path: 'infos',
    title: 'Infos pratiques · Terera’a',
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
    path: 'liens',
    title: 'Liens utiles · Terera’a',
    loadComponent: () => import('./features/links/links.component').then((m) => m.LinksComponent),
  },
  {
    path: 'reglages',
    title: 'Réglages · Terera’a',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'reglages/changelog',
    title: 'Nouveautés · Terera’a',
    loadComponent: () =>
      import('./features/changelog/changelog.component').then((m) => m.ChangelogComponent),
  },
  {
    path: '**',
    title: 'Page introuvable · Terera’a',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
