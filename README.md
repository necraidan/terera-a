# Terera'a

Boîte à outils pour un voyage en Polynésie française. « Terera'a » signifie « le voyage » en tahitien.

C'est une PWA installable, pensée pour l'iPhone et pour **fonctionner entièrement hors ligne** : sur un motu, en excursion ou dans un atoll sans réseau, tout reste disponible. Aucune donnée n'est envoyée nulle part, aucune autorisation n'est demandée.

## Les outils

| Outil               | Ce qu'il fait                                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Convertisseur**   | Euro ↔ franc pacifique, dans les deux sens, avec montants rapides. Repose sur la parité fixe légale (1 € = 119,331742 F) : le taux ne varie pas, donc aucune API n'est nécessaire.                      |
| **Heure**           | Heure de Tahiti et de la France côte à côte, décalage courant (11 h ou 12 h selon l'heure d'été française), convertisseur d'heure avec bascule de jour, et créneau raisonnable pour appeler la famille. |
| **Lexique**         | Une soixantaine de mots et expressions de reo tahiti, avec prononciation, recherche insensible aux accents et favoris.                                                                                  |
| **Infos pratiques** | Urgences (numéros cliquables), téléphone et indicatif +689, électricité, usages et politesse, monnaie, saisons et jours fériés.                                                                         |

## Développement

Le projet utilise **pnpm** et Node 24.

```bash
pnpm install
pnpm start          # serveur de développement (service worker désactivé)
pnpm build          # build de production, dans dist/terera-a/browser
pnpm lint
pnpm test
pnpm format
pnpm make:icons     # régénère les icônes depuis le SVG de scripts/make-icons.js
```

Stack : Angular 22 standalone et zoneless, Tailwind CSS 4 (tokens dans `src/styles.css`), `@angular/service-worker`, tests Vitest.

Les données (lexique, fiches pratiques) sont des constantes TypeScript typées dans `src/app/shared/data/` : elles sont compilées dans le bundle, donc mises en cache par le service worker et disponibles hors ligne par construction.

### Tester le mode hors ligne et les mises à jour

Le service worker n'est actif qu'en build de production. Pour l'exercer en local :

```bash
pnpm build
cp dist/terera-a/browser/index.html dist/terera-a/browser/404.html
npx http-server dist/terera-a/browser -p 8080 -c-1 --proxy "http://127.0.0.1:8080?"
```

`-c-1` désactive le cache HTTP et `--proxy` fournit le fallback SPA pour les liens profonds. Ouvrez `http://127.0.0.1:8080`, laissez le service worker s'enregistrer (état visible sur `/ngsw/state`), puis coupez le réseau : l'app entière doit continuer à fonctionner.

## Publier une nouvelle version

L'app prévient l'utilisateur quand une nouvelle version est disponible et lui permet de la déclencher. Pour que ça marche, chaque release suit ces trois étapes :

1. **Ajouter une entrée** en tête de `src/app/features/changelog/changelog.data.ts`.
2. **Incrémenter la version** : `pnpm version patch` (ou `minor`).
3. **Pousser sur `main`** : le workflow `.github/workflows/deploy.yml` lint, teste, build et déploie sur GitHub Pages.

Un test vérifie que la première entrée du changelog correspond à la version de `package.json` : oublier l'une des deux étapes casse le build, pas l'expérience utilisateur.

Ne déployez jamais un build de développement : la configuration `production` est la seule qui génère `ngsw.json`, et son absence ferait passer les clients déjà installés en mode dégradé.

### Comment la mise à jour est détectée

L'identité d'une version, pour le service worker, est l'empreinte de `ngsw.json`. Comme la version et le changelog sont compilés dans le bundle, chaque release modifie mécaniquement un fichier et produit donc une nouvelle empreinte : la détection est garantie.

`UpdateService` (`src/app/core/update.service.ts`) vérifie au démarrage, toutes les 30 minutes, et surtout **au retour de l'app au premier plan** — le déclencheur qui compte sur iPhone, où l'app est suspendue dès qu'on la quitte. Quand une version est prête, une bannière apparaît ; le rechargement n'est jamais automatique, pour ne pas faire perdre une saisie en cours.

À noter sur iOS : le service worker sert toujours la version en cache d'abord, donc une nouvelle version n'apparaît jamais sur le premier écran mais en cours de session. Et le tout premier lancement après « Ajouter à l'écran d'accueil » doit se faire **en ligne**, le stockage d'une app installée étant isolé de celui de Safari.

## Installer sur iPhone

Ouvrir le site dans Safari, puis Partager → « Sur l'écran d'accueil ». L'app se lance ensuite en plein écran, sans barre d'adresse, et fonctionne en mode avion.
