# Terera'a

Boîte à outils pour un voyage en Polynésie française. « Terera'a » signifie « le voyage » en tahitien.

C'est une PWA installable, pensée pour l'iPhone et pour **fonctionner entièrement hors ligne** : sur un motu, en excursion ou dans un atoll sans réseau, tout reste disponible. Aucune donnée n'est envoyée nulle part, aucune autorisation n'est demandée.

## Les outils

| Outil                  | Ce qu'il fait                                                                                                                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Convertisseur**      | Franc pacifique ↔ Euro, dans les deux sens, avec montants rapides. Repose sur la parité fixe légale (1 € = 119,331742 F) : le taux ne varie pas, donc aucune API n'est nécessaire.                                                                                                                      |
| **Billets et pièces**  | Les quatre billets et les six pièces de la série en cours, dessinés à l'échelle réelle. Couleurs, motifs, dimensions, équivalent en euros, ce que chaque coupure permet d'acheteret les pièges de reconnaissance (le 20 F argenté est plus large que le 50 F doré).                                     |
| **Heure**              | Heure de Tahiti et de la France côte à côte, décalage courant (11 h ou 12 h selon l'heure d'été française), convertisseur d'heure avec bascule de jouret créneau raisonnable pour appeler la famille.                                                                                                   |
| **Unités**             | Milles nautiques, nœuds, pieds, brasses, degrés Fahrenheit. Tous les facteurs sont des définitions exactes.                                                                                                                                                                                             |
| **Soleil et marées**   | Lever, coucher, aube et nuit civile calculés localement pour 19 îles avec l'algorithme solaire de la NOAA. Plus le régime de marée par archipel, dont le cas remarquable de la Société où les heures suivent le soleil et non la lune.                                                                  |
| **Carte et distances** | Les cinq archipels sur une carte hors ligne, les îles positionnées selon leurs coordonnées réelles, avec échelle. Distances et caps calculés depuis les coordonnées, durées de vol et liaisons maritimes.                                                                                               |
| **Faune marine**       | 18 espèces avec nom tahitien, saison de présence, niveau de risque réel pour l'humain, règles d'approche et statut de protection. Plus la réglementation du sanctuaire des mammifères marins.                                                                                                           |
| **Randonnées**         | Les sentiers de Tahiti, de sa presqu'île et de Moorea, filtrables par île, difficulté, longueur et durée. Chaque fiche porte le plan du sentier tracé depuis les coordonnées, ses avertissements, le niveau d'encadrement, les accès réglementés, la provenance des données et la date de vérification. |
| **Lexique**            | Une centaine de mots et expressions de reo tahiti, plus 56 noms de lieux avec leur prononciation. Recherche insensible aux accents, favoriset une page de règles de prononciation.                                                                                                                      |
| **Infos pratiques**    | Urgences (numéros cliquables), téléphone et indicatif +689, électricité, usages et politesse, monnaie, saisons et jours fériés.                                                                                                                                                                         |
| **Liens utiles**       | 47 sites officiels et pérennes, vérifiés un par un et rangés par usage. C'est le seul écran qui demande une connexionet il le dit.                                                                                                                                                                      |

## Sur la vérification du contenu

Le contenu factuel a été recherché puis soumis à une relecture adversariale, chargée de réfuter chaque affirmation plutôt que de la valider. Plusieurs erreurs ont ainsi été corrigées avant intégration : une distance inter-îles fausse de 100 km, une série de pièces obsolète, une affirmation inexacte sur le rôle du calendrier lunaire dans les marées, des noms tahitiens non attestés, un prix de repas sous-évalué.

Les données qui peuvent se vérifier par le calcul le sont : aucune distance n'est stockée, elles sont dérivées des coordonnéeset un test compare les distances obtenues aux valeurs publiées ainsi que les durées de vol aux vitesses plausibles d'un ATR.

### Les plans de randonnée

Les tracés viennent d'**OpenStreetMap**, sous licence ODbL, qui impose l'attribution : chaque plan porte son crédit à l'écran. Ils ne sont pas saisis à la main mais générés par [make-tracks.js](scripts/make-tracks.js), où les chemins retenus sont déclarés un par un par leur identifiant OSM, avec ce que le tracé couvre réellement. Aucune sélection automatique par proximité : sans cette liste explicite, une mise à jour d'OSM pourrait faire passer silencieusement un tracé par un sentier voisin.

Quatre des huit tracés sont **partiels**, parce que le bas de l'approche ou la piste d'accès n'est pas cartographié. La fiche le dit, et le trait est dessiné en pointillés. Te Pari, sur la presqu'île, n'a aucun tracé : la côte n'est pas dans OSM, et dessiner une ligne approximative sur un littoral sans échappatoire serait la pire des approximations. L'écran l'annonce plutôt que de meubler.

Le fond de carte est **vectoriel, pas raster**, et c'est le cœur du compromis. Des tuiles d'image coûteraient des centaines de kilo-octets par sentier, à précharger pour un usage hors ligne. Une poignée de polylignes triées tient en quelques kilo-octets : la côte, les plans d'eau, les rivières, les routes, les sentiers voisins assez longs pour être des options, et les sommets nommés avec leur altitude. Le brut est inexploitable, cinq cents pistes et deux cent soixante-dix ruisseaux pour une seule emprise noieraient le tracé, donc le script filtre par nature et par longueur, découpe sur le cadre et simplifie jusqu'à tenir un budget de points. Chaque plan porte aussi un **encart de localisation** : la silhouette de l'île et un point sur le sentier, parce qu'à l'échelle d'une vallée le plan ne dit pas de lui-même où l'on se trouve.

Un plan reste un **schéma d'orientation, pas un outil de navigation**, et il le dit sous chaque tracé : il n'y a ni position GPS, ni balisage sur le terrain.

Le lien entre les deux est vérifié par le calcul : la longueur de la polyligne, sommée par `haversineKm`, est comparée à la distance publiée, en tenant compte du fait qu'un aller-retour annonce la distance totale quand le tracé ne décrit qu'un aller. Un tracé annoncé complet doit tomber à moins de trente pour cent de la distance publiée, un tracé partiel doit être franchement plus court. Le plan ne peut donc pas mentir sur la distance, ni la distance sur le plan.

### Photos

Les billets, les pièces et les espèces marines sont illustrés par des photos de Wikimedia Commons, converties en webp et embarquées dans `public/images/` pour rester disponibles hors ligne. Chaque photo porte son auteur et sa licence dans les données (`money.data.ts`, `wildlife.data.ts`), affichés à l'écran là où la photo est visible en grand. Les fichiers ont été choisis dont le nom porte le nom scientifique, ce qui rend l'identification vérifiable : la photo de tête que Wikipédia associait au requin corail montrait en réalité un requin à ailerons blancs (Carcharhinus albimarginatus), elle a été remplacée. Exception : la photo des dauphins a été fournie sans provenance ; son crédit indique « source non identifiée », faute de pouvoir nommer un auteur et une licence.

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
pnpm make:tracks    # régénère les tracés de randonnée depuis OpenStreetMap
```

Stack : Angular 22 standalone et zoneless, Tailwind CSS 4 (tokens dans `src/styles.css`), `@angular/service-worker`, tests Vitest.

Les données (lexique, fiches pratiques) sont des constantes TypeScript typées dans `src/app/shared/data/` : elles sont compilées dans le bundle, donc mises en cache par le service worker et disponibles hors ligne par construction.

### Rendre une donnée rafraîchissable

La v1 n'appelle aucun réseau : `provideHttpClient` est volontairement absent, car le fournir sans l'utiliser coûte environ 5 ko gzip à chaque chargement pour du code jamais appelé. Le jour où une donnée devra bouger (marées, météo, taux non arrimé…), trois changements suffisent :

1. Déplacer le jeu de données de `src/app/shared/data/` vers `public/data/<nom>.json`.
2. Ajouter `provideHttpClient(withFetch())` dans [app.config.ts](src/app/app.config.ts) et lire la donnée avec `httpResource<T>('data/<nom>.json')`, dont l'état de chargement et d'erreur est déjà exposé en signals.
3. Déclarer un `assetGroup` dédié dans [ngsw-config.json](ngsw-config.json), en `installMode: prefetch` et `updateMode: prefetch`, pour que la dernière version connue reste servie hors ligne.

Le reste de l'app n'a pas à changer : les écrans consomment déjà leurs données via des signals.

### Tester le mode hors ligne et les mises à jour

Le service worker n'est actif qu'en build de production. Pour l'exercer en local :

```bash
pnpm build
cp dist/terera-a/browser/index.html dist/terera-a/browser/404.html
npx http-server dist/terera-a/browser -p 8080 -c-1 --proxy "http://127.0.0.1:8080?"
```

`-c-1` désactive le cache HTTP et `--proxy` fournit le fallback SPA pour les liens profonds. Ouvrez `http://127.0.0.1:8080`, laissez le service worker s'enregistrer (état visible sur `/ngsw/state`), puis coupez le réseau : l'app entière doit continuer à fonctionner.

Attention : sur `localhost`, ngsw bloque son initialisation sur le préchargement complet, alors qu'en production il le fait en tâche de fond. Un test local ne reproduit donc pas fidèlement une installation interrompue.

### Pourquoi la coquille est un `assetGroup` à part

Les groupes de [ngsw-config.json](ngsw-config.json) sont téléchargés dans l'ordre où ils sont déclarés, et les fichiers d'un groupe dans l'ordre alphabétique. Tout ce qui précède `index.html` retarde donc le moment où l'app devient lançable hors ligne.

C'est un vrai risque sur iPhone, où WebKit suspend le service worker dès que l'app passe à l'arrière-plan : une installation interrompue avant `index.html` laisse une app qui, hors ligne, ne rend plus qu'une page d'erreur Safari — le worker tente de récupérer `index.html` sur le réseau, récolte un 504 et l'erreur remonte jusqu'à la navigation. Relancer l'app ne répare rien : le même échec se reproduit tant que le réseau n'est pas revenu.

D'où l'ordre : `shell` (index, JS d'amorçage, CSS, manifeste) d'abord, puis le reste du code, puis les images. Un préchargement interrompu ne coûte alors que du contenu manquant, jamais l'app entière — et `UpdateService` ne recharge jamais la page hors ligne, où un rechargement remplacerait une app dégradée par une app morte.

## Publier une nouvelle version

L'app prévient l'utilisateur quand une nouvelle version est disponible et lui permet de la déclencher. Pour que ça marche, chaque release suit ces trois étapes :

1. **Ajouter une entrée** en tête de `src/app/features/changelog/changelog.data.ts`.
2. **Incrémenter la version** : `pnpm version patch` (ou `minor`).
3. **Pousser sur `main`** : le workflow `.github/workflows/deploy.yml` lint, teste, build et déploie sur GitHub Pages.

Un test vérifie que la première entrée du changelog correspond à la version de `package.json` : oublier l'une des deux étapes casse le build, pas l'expérience utilisateur.

Ne déployez jamais un build de développement : la configuration `production` est la seule qui génère `ngsw.json`et son absence ferait passer les clients déjà installés en mode dégradé.

### Comment la mise à jour est détectée

L'identité d'une version, pour le service worker, est l'empreinte de `ngsw.json`. Comme la version et le changelog sont compilés dans le bundle, chaque release modifie mécaniquement un fichier et produit donc une nouvelle empreinte : la détection est garantie.

`UpdateService` (`src/app/core/update.service.ts`) vérifie au démarrage, toutes les 30 minuteset surtout **au retour de l'app au premier plan**, le déclencheur qui compte sur iPhone, où l'app est suspendue dès qu'on la quitte. Quand une version est prête, une bannière apparaît ; le rechargement n'est jamais automatique, pour ne pas faire perdre une saisie en cours.

À noter sur iOS : le service worker sert toujours la version en cache d'abord, donc une nouvelle version n'apparaît jamais sur le premier écran mais en cours de session. Et le tout premier lancement après « Ajouter à l'écran d'accueil » doit se faire **en ligne**, le stockage d'une app installée étant isolé de celui de Safari.

## Installer sur iPhone

Ouvrir le site dans Safari, puis Partager → « Sur l'écran d'accueil ». L'app se lance ensuite en plein écran, sans barre d'adresseet fonctionne en mode avion.
