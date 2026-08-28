# Étude : un outil Randonnées pour Terera'a

Sentiers de Polynésie française, classés par île, filtrables par difficulté, longueur et durée, avec un plan du parcours sur chaque fiche, consultables entièrement hors ligne.

- Date : 28 août 2026, sur la base de la version 1.1.1.
- Méthode : workflow de 11 agents. Trois lecteurs ont cartographié le dépôt, deux chercheurs ont recensé 43 randonnées sur les cinq archipels, deux relecteurs adversariaux ont vérifié chaque valeur contre des sources indépendantes (32 confirmées, 4 corrigées, 9 douteuses, 0 réfutée), trois conceptions indépendantes ont été notées (8,5, 7,5 et 7,5 sur 10) puis fusionnées par un juge.
- Périmètre v1 tranché : Tahiti avec sa presqu'île, plus Moorea.

## État : implémenté en version 1.2.0

L'outil est livré. Ce document reste la trace du raisonnement, des sources et des arbitrages ; le code en est la mise en œuvre. Ce qui a changé en cours de route par rapport à la conception ci-dessous :

- **Les tracés vivent dans un fichier généré**, `hikes.tracks.ts`, produit par [make-tracks.js](../scripts/make-tracks.js) depuis OpenStreetMap. Le modèle ne porte pas les coordonnées mais un champ `trackCoverage`, parce que la réalité de la couverture OSM est plus nuancée que prévu : **8 des 9 fiches ont un tracé, dont 4 partiels**, et Te Pari n'en a aucun. L'écran le dit à chaque fois plutôt que de meubler.
- **Un champ `sources` a été ajouté au modèle** et s'affiche en pied de fiche, à côté de la date de vérification. Les URLs restent en commentaires du fichier de données, puisque les liens http y sont interdits.
- **Un invariant de plus** : la longueur de la polyligne est comparée à la distance publiée, en tenant compte de la convention aller-retour. C'est le garde-fou qui empêche un plan de mentir sur la distance.
- **Un fond de carte vectoriel a été ajouté** après coup : un tracé seul sur du blanc ne dit pas où l'on est. Côte, plans d'eau, rivières, routes, sentiers voisins et sommets nommés, triés et simplifiés depuis OpenStreetMap, plus un encart de localisation avec la silhouette de l'île. Coût réel : environ 6,6 ko transférés, uniquement sur l'écran de la fiche.
- **Le rapport d'aspect du plan a été corrigé** grâce à un test d'isotropie : le calcul portait sur le viewBox entier alors que la projection remplit le cadre intérieur, marges déduites, ce qui étirait les tracés de dix pour cent.
- Questions ouvertes tranchées à l'implémentation : bornes de durée à 3 h et 5 h, île persistée, exclusion des métriques absentes des filtres, deux points remarquables par plan, pas de contacts de guides en `tel:`, pas de photos, profil altimétrique reporté.

## Verdict

La fonctionnalité est faisable en restant strictement dans les conventions du projet : une paire `hikes.models.ts` / `hikes.data.ts`, deux écrans lazy calqués sur la faune marine, des filtres en signals sans aucune bibliothèque, et un chunk lazy de 25 à 40 Ko (texte plus tracés) qui ne touche ni `ngsw-config.json` ni `public/`. Le vrai travail n'est pas technique, il est éditorial : les sources divergent de 30 à 100 % sur certaines métriques, et une bonne partie de l'effort ira à l'arbitrage des valeurs, à la collecte des tracés et à la relecture adversariale du contenu, comme pour les autres jeux de données du projet.

| Indicateur                               | Valeur          |
| ---------------------------------------- | --------------- |
| Randonnées recensées et vérifiées        | 43 sur 18 îles  |
| Fiches v1 (Tahiti + presqu'île + Moorea) | 9               |
| Données réfutées à la vérification       | 0               |
| Poids réel v1 (chunks lazy, transféré)   | 14,8 ko gzip    |
| Dépendance ajoutée                       | 0               |
| Effort estimé                            | 3,5 à 4,5 jours |

## 1. Ce que l'app impose

Une nouvelle feature n'a pas de liberté d'architecture, et c'est une force : tout est déjà tranché.

- **Données en paire modèle/données.** Interfaces à champs `readonly`, types union pour les énumérations, Records de labels et de classes Tailwind colocalisés. Le modèle est `wildlife.models.ts` avec `MarineRisk`, `RISK_LABELS`, `RISK_CLASSES`.
- **Les îles ont déjà un identifiant.** `Island.id` en kebab-case (`tahiti`, `moorea`), archipel en union stricte à cinq valeurs. Une randonnée référence `islandId`, jamais un nom en clair, et un test vérifie la jointure comme `islands.spec.ts` le fait pour les archipels.
- **Rien de dérivable n'est stocké, tout est testé.** Les distances viennent des coordonnées via `haversineKm` (geo.ts), les specs vérifient ids uniques, bornes plausibles, invariants métier (vitesse ATR entre 200 et 600 km/h). Le jeu de données randonnées devra offrir le même niveau d'auto-défense.
- **Hors ligne par construction.** Aucun lien `http` dans les données livrées (testé, seuls les `tel:` passent), constantes compilées dans le bundle, images préchargées par le service worker. Chaque Mo ajouté sous `public/` allonge la fenêtre d'interruption iOS et se retélécharge à chaque release.
- **Mécaniques prêtes à réutiliser.** `FavoritesSet` (une sous-classe de trois lignes suffit), `readStored`/`writeStored`, routes lazy avec titre suffixé, pastille de nouveautés via le changelog versionné, et surtout `projectToSvg`/`boundsOf` dans geo.ts, déjà testés, qui serviront au plan de sentier.

## 2. Le contenu disponible, vérifié

Deux agents ont recensé les randonnées documentées sur les cinq archipels, puis deux relecteurs adversariaux ont tenté de réfuter chaque valeur contre des sources indépendantes de celles utilisées à la collecte. Bilan : 32 confirmées, 4 corrigées, 9 douteuses (sources divergentes sans pouvoir trancher), 0 réfutée. L'inventaire complet avec statuts est en annexe A, les sources détaillées par randonnée en annexe B.

Constats structurants :

- Il n'existe **aucun topoguide officiel exhaustif**. Tahiti Tourisme décrit les sites mais ne chiffre presque jamais distance et dénivelé. La source chiffrée la plus cohérente est le topo-guide local tahiti-rando.fr, à croiser avec les traces GPS publiques et les récits de terrain.
- Le guide est souvent obligatoire non pour la difficulté mais pour le **foncier privé** (Trois Cascades de Raiatea) ou la **réglementation** (plateau Temehani classé depuis 2010, accès payant et nominatif de la vallée de la Fautaua : 600 XPF, billet à retirer à la mairie de Papeete).
- Les **Tuamotu n'ont logiquement presque rien** : des atolls plats ne se randonnent pas. L'exception est Makatea, l'atoll soulevé et ses falaises.
- Corrections notables de la passe adversariale : le mont Aorai ne requiert pas de guide (conseillé seulement, sentier balisé avec refuges), le Te Pari est chiffrable (environ 9 km, il était noté introuvable), le col des Trois Pinus fait environ +130 m et non +200 m, et les 6,5 km de Makatea étaient l'aller seul (13 km aller-retour).

### Le périmètre v1 : Tahiti, sa presqu'île et Moorea

Neuf fiches, toutes vérifiées. Valeurs après correction adversariale ; « nc » signifie non chiffré dans les sources (le champ restera absent, jamais estimé).

| Randonnée                                       | Difficulté     | Km      | Durée  | D+    | Guide               | Vérif.   | Sources principales                                 |
| ----------------------------------------------- | -------------- | ------- | ------ | ----- | ------------------- | -------- | --------------------------------------------------- |
| Vallée de la Fautaua (cascade de Loti)          | difficile      | 9,8     | 4 h    | +200  | non (billet mairie) | confirmé | tahiti-rando.fr, ville-papeete.pf, blog-trotting.fr |
| Mont Aorai (2 066 m)                            | très difficile | 18      | 9 h    | +1500 | conseillé           | corrigé  | tahiti-rando.fr, todotahiti.com, iaorana.com        |
| Antennes du mont Marau (1 493 m)                | moyen          | 17,5    | 6 h    | +960  | non                 | confirmé | tahiti-rando.fr, iaorana.com                        |
| Te Pari, falaises de la presqu'île (Tahiti Iti) | moyen          | ≈9      | 6 h 30 | ≤60   | obligatoire         | corrigé  | tahitirevatrek.com, todotahiti.com, wikiloc.com     |
| Col des Trois Cocotiers (Moorea)                | facile         | 4,3 à 7 | 2 h 30 | +200  | non                 | douteux  | tahiti-rando.fr, denivpositif.com, tahiti-infos.com |
| Col des Trois Pinus (Moorea)                    | facile         | 3       | 1 h 30 | +130  | non                 | corrigé  | tahiti-rando.fr, denivpositif.com                   |
| Cascade de la Vaioro, Afareaitu (Moorea)        | facile         | 4,3     | 1 h 30 | +120  | non                 | confirmé | tahiti-rando.fr                                     |
| Mont Rotui, 899 m (Moorea)                      | très difficile | 8       | 6 h    | +900  | conseillé           | confirmé | alltrails.com, liliguide.com, wikiloc.com           |
| Mont Mou'aputa, la montagne percée (Moorea)     | très difficile | 7       | 6 h    | +800  | conseillé           | confirmé | alltrails.com, moanavoyages.com, manawa.com         |

Écartés du périmètre : les lavatubes de Hitiaa (activité encadrée type canyoning, pas une randonnée). Le col des Trois Cocotiers entre avec un `metricsNote` : les sources divergent nettement (4,3 à 7 km selon le point de départ), la valeur la plus prudente est retenue et le désaccord est dit à l'utilisateur.

### Les extensions suivantes, sans code

L'inventaire vérifié couvre déjà les lots suivants : Société restante (Raiatea, Tahaa, Huahine, Bora Bora, Maupiti : 12 fiches candidates), Marquises (Vaipo, Hatiheu-Anaho, Tōvi'i, Hanatekuua, Poumaka, la Traversière de Ua Pou, Omoa-Hanavave : 7 fiches solides), Australes et Gambier (7 fiches). Attention : Fatu Hiva, Ua Huka, Rimatara et Makatea sont absentes d'`ISLANDS` (islands.data.ts) ; le test de jointure imposera de les ajouter (elles apparaîtront aussi sur la carte, bénéfice collatéral) ou de reporter leurs randonnées.

## 3. Conception proposée

Trois conceptions indépendantes ont été produites puis départagées : une v1 minimale fidèle au dépôt (notée 8,5/10), une approche expérience d'abord (7,5), une approche contenu traçable d'abord (7,5). La synthèse prend la première comme base et lui greffe le meilleur des deux autres : l'entrée préfiltrée depuis la carte, le guide à trois niveaux, les invariants adversariaux et le « Vérifié le ». S'y ajoute une exigence produit : **chaque fiche porte un plan du parcours**, pas seulement du texte.

### 3.1 Le modèle de données

Principe central : une métrique introuvable est absente, jamais 0 ni une estimation. La provenance vit à deux niveaux : les URLs précises et les arbitrages en commentaires de `hikes.data.ts` (l'app interdit tout lien http dans les données livrées), et un champ `sources` en texte, affiché sur la fiche, comme `photoCredit` l'est pour les photos.

```ts
// src/app/shared/data/hikes.models.ts

export type HikeDifficulty = 'facile' | 'moyen' | 'difficile' | 'tres-difficile';
export type HikeKind = 'aller-retour' | 'boucle' | 'traversee';

/**
 * 'obligatoire' couvre la réglementation (Temehani) comme le foncier privé
 * (Trois Cascades, Te Pari), 'conseille' l'usage local fortement recommandé
 * (Rotui, Aorai), 'facultatif' les sentiers praticables seul.
 */
export type GuideLevel = 'facultatif' | 'conseille' | 'obligatoire';

/** Point du tracé simplifié : [lat, lon]. */
export type TrackPoint = readonly [number, number];

export interface HikeWaypoint {
  readonly lat: number;
  readonly lon: number;
  /** Court : 'Départ', 'Refuge Fare Mato', 'Cascade'. */
  readonly label: string;
}

export interface Hike {
  /** Kebab-case, segment d'URL : ne pas renommer sans redirection. */
  readonly id: string;
  readonly name: string;
  /** Référence Island.id (islands.data.ts), jamais un nom en clair ; jointure testée. */
  readonly islandId: string;
  readonly difficulty: HikeDifficulty;
  readonly kind: HikeKind;
  /** Distance totale en km ; absente quand aucune source fiable ne la publie. */
  readonly lengthKm?: number;
  /** Durée totale de marche en minutes, pauses non comprises (210 = 3 h 30). */
  readonly durationMin?: number;
  /** Dénivelé positif cumulé en mètres ; absent si introuvable. */
  readonly elevationGainM?: number;
  /** Désaccord notable entre sources, dit à l'utilisateur. */
  readonly metricsNote?: string;
  readonly guide: GuideLevel;
  /** Non vide dès que guide n'est pas 'facultatif' (testé). */
  readonly guideNote?: string;
  /** Accès réglementé : billet, autorisation, propriété privée. */
  readonly accessNote?: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  /** Conseils pratiques : eau, heure de départ, équipement. */
  readonly advice: readonly string[];
  /** Non vide si 'tres-difficile' ou guide 'obligatoire' (testé). */
  readonly warnings: readonly string[];
  /**
   * Tracé simplifié du parcours, 30 à 80 points, pour le plan de la fiche.
   * Ce n'est pas un outil de navigation et l'écran le dit.
   */
  readonly track: readonly TrackPoint[];
  /** Points remarquables posés sur le plan. */
  readonly waypoints?: readonly HikeWaypoint[];
  /** Provenance du tracé, affichée sous le plan, ex 'Tracé d'après les contributeurs OpenStreetMap'. */
  readonly trackCredit: string;
  /** Provenance des métriques, affichée en pied de fiche, ex 'tahiti-rando.fr et mairie de Papeete'. */
  readonly sources: readonly string[];
  /** Date ISO de dernière vérification humaine, affichée 'Vérifié le ...'. */
  readonly reviewedOn: string;
}
```

S'y ajoutent, sur le modèle de la faune : `DIFFICULTY_LABELS` et `DIFFICULTY_CLASSES` (même gamme de tokens que `RISK_CLASSES`), `KIND_LABELS`, `GUIDE_LABELS`, les tranches de filtre (`LengthBucket` : moins de 5 km, 5 à 10 km, plus de 10 km ; `DurationBucket` : moins de 3 h, 3 à 5 h, plus de 5 h), les prédicats purs `matchesLength` / `matchesDuration` testés aux bornes exactes, un `formatDuration` (210 devient « 3 h 30 »), et un `HikeFavoritesStore extends FavoritesSet` de trois lignes (clé `hikes:favorites`).

Sémantique des métriques absentes, tranchée : une randonnée sans distance publiée ne matche aucune tranche du filtre longueur. Filtrer exclut honnêtement ce qu'on ne sait pas mesurer ; elle reste visible avec « Toutes », où sa carte affiche « Topo non chiffré ».

### 3.2 Le plan de la randonnée

Chaque fiche affiche un plan du parcours : un composant `ta-hike-map` qui rend le tracé en SVG inline, exactement comme la carte des archipels rend les îles.

- **Rendu.** `boundsOf` et `projectToSvg` (geo.ts, déjà testés) projettent les points du `track` dans un viewBox. Polyligne du parcours avec les tokens de couleur du thème, point de départ marqué, waypoints étiquetés (refuge, cascade, sommet, col), barre d'échelle dérivée des coordonnées via `haversineKm` et `formatKm`, flèche du nord. Aucun fond de carte : un plan schématique d'orientation, sobre, lisible en plein soleil, cohérent avec l'esthétique de l'écran Carte et distances.
- **Poids.** 30 à 80 points par tracé, soit environ 0,5 à 2 Ko par fiche dans le chunk lazy. Les 9 fiches v1 tiennent dans 10 à 15 Ko de tracés. Aucun octet sous `public/`, aucun impact sur `ngsw-config.json`.
- **Provenance et licence.** Les tracés sont dérivés d'OpenStreetMap quand le sentier y est cartographié (licence ODbL, attribution obligatoire : le champ `trackCredit` est affiché sous le plan, en texte, comme `photoCredit` sous les photos). Les traces Wikiloc et AllTrails servent à vérifier, jamais à copier : ce sont des contenus utilisateurs sous conditions d'utilisation propriétaires. Le géoportail officiel Te Fenua (te fenua.gov.pf) est à examiner comme source complémentaire, licence à vérifier avant usage. En dernier recours, numérisation manuelle à partir de plusieurs descriptions croisées, assumée comme schématique dans `trackCredit`.
- **Outillage.** Un script `scripts/make-tracks.js` (même esprit que `make-icons.js`) : il lit des GPX ou GeoJSON déposés dans `scripts/tracks/` (non embarqués dans l'app), simplifie par Douglas-Peucker à la tolérance voulue, et régénère les constantes `track` de `hikes.data.ts`. La source amont et sa date restent en commentaire au-dessus de chaque tracé.
- **Invariant croisé, dans l'esprit du dépôt.** La longueur de la polyligne, sommée par `haversineKm`, doit concorder avec `lengthKm` (ratio entre 0,75 et 1,25 quand les deux existent, la simplification raccourcit légèrement). Le plan ne peut donc pas mentir sur la distance, et réciproquement : c'est le même principe que les distances inter-îles dérivées des coordonnées.
- **Sécurité.** Le plan est explicitement un schéma d'orientation, pas un outil de navigation : mention sous le plan, et pas de GPX téléchargeable ni de position GPS en v1, qui donneraient une fausse assurance en fond de vallée sans signal.
- **Profil altimétrique** : option pour une version ultérieure (`profile?: readonly number[]`, élévations échantillonnées le long du tracé depuis un MNT libre type SRTM, rendu en mini SVG de quelques centaines d'octets). Hors v1 pour ne pas allonger le chemin critique.

### 3.3 Les deux écrans

**Liste `/randonnees`** (HikesComponent), de haut en bas :

1. Select natif « Île » (précédent : le select de distances de la carte), option « Toutes les îles », puis uniquement les îles ayant des randonnées, dans l'ordre d'`ISLANDS`.
2. Trois bandes de chips `ta-quick-chip` : Difficulté, Longueur, Durée, chacune avec « Toutes » en tête, labels tirés des Records.
3. Compteur « N randonnées » et bouton « Réinitialiser » visible quand un filtre est actif.
4. Cartes groupées par île (h2 uppercase, mécanique du lexique) sans île sélectionnée ; liste plate triée de facile vers très difficile puis durée croissante quand une île est choisie. Chaque carte : nom, pastille de difficulté (label dans la pastille, jamais la couleur seule), métriques connues (« 9,8 km · 4 h · +200 m »), « Topo non chiffré » si rien, badge guide, étoile favori.
5. Section « Mises de côté » en tête quand il y a des favoris.
6. En pied de liste, avertissement permanent : sentiers rarement balisés, foncier privé fréquent, terrain glissant après pluie, partir tôt, informations vérifiées à la date de la version.

**Fiche `/randonnees/:id`** (HikeDetailComponent), le danger avant le rêve :

1. Identité : île et archipel, pastille difficulté, badges type et guide, étoile favori.
2. Warnings en carte teintée danger, avant tout le reste, quand ils existent.
3. Encarts conditionnels « Avec un guide » (guideNote) et « Accès réglementé » (accessNote).
4. **Le plan du parcours** (`ta-hike-map`) avec ses waypoints, l'échelle et son crédit.
5. « En chiffres » : distance, durée, dénivelé ; un fait absent affiche « non publiée », jamais masqué. `metricsNote` en encart « Selon les sources » quand présent.
6. Sections : résumé, « À voir » (highlights), « Conseils » (advice, avec lien interne vers Soleil et marées quand l'heure de départ prend son sens à côté du lever du soleil).
7. Pied de fiche : « D'après {sources}, vérifié le {reviewedOn} » formaté fr-FR.

### 3.4 La mécanique de filtres

Quatre dimensions combinées en ET logique dans un seul `computed`, mécanique signal déjà utilisée par le lexique et la faune, zéro bibliothèque.

```ts
protected readonly visible = computed(() =>
  HIKES.filter((hike) =>
    (this.island() === null || hike.islandId === this.island()) &&
    (this.difficulty() === null || hike.difficulty === this.difficulty()) &&
    (this.length() === null || matchesLength(hike, this.length()!)) &&
    (this.duration() === null || matchesDuration(hike, this.duration()!))));
```

Deux choix assumés :

- **Seule l'île persiste** (clé `hikes:island` via `readStored`/`writeStored`) : c'est le seul filtre stable pendant un séjour, l'écran rouvre sur Moorea au deuxième lancement. Les trois autres filtres repartent à zéro à chaque visite pour ne jamais masquer silencieusement des randonnées des jours plus tard. La valeur stockée n'est restaurée que si elle existe encore dans les données.
- **Entrée préfiltrée depuis la carte** : le panneau d'île de `/carte` gagne une ligne « N randonnées sur cette île » qui navigue vers `/randonnees?ile=moorea`, captée par `withComponentInputBinding` déjà actif. Réciproquement, la fiche propose « Voir {île} sur la carte ».

### 3.5 Impact hors ligne et intégration

- 25 à 40 Ko (texte + tracés) dans le chunk lazy de la feature, couvert par le groupe `app` existant de `ngsw-config.json` : aucun octet sous `public/`, la coquille reste protégée en cas d'installation interrompue sur iPhone.
- Home : `{ icon: '🥾', label: 'Randonnées', hint: 'Sentiers par île et par niveau', route: '/randonnees' }`, inséré après Faune marine.
- Deux routes lazy dans `app.routes.ts` : `randonnees` (titre « Randonnées · Terera'a ») et `randonnees/:id` sans titre statique, comme `faune/:id`.
- Release : entrée changelog, `pnpm version minor` (1.2.0, nouvel outil = minor), pastille de nouveautés automatique via WhatsNewService.
- Si des photos arrivent un jour : calibrage type Billets et pièces (330 px, 15 à 20 Ko pièce), champ `image` ajouté au modèle à ce moment-là seulement, invariants de nommage et de crédit étendus dans `content.spec.ts`. Décision explicite, pas un défaut.

## 4. La stratégie de contenu, outillée par les tests

Protocole écrit dans l'en-tête de `hikes.data.ts` :

1. **Règle d'inclusion** : une fiche entre seulement si sa durée est sourcée, sa difficulté cotable et son tracé constructible proprement (OSM ou numérisation assumée).
2. **Règle des deux sources** : chaque métrique est recoupée sur au moins deux sources indépendantes ; source unique signalée en commentaire.
3. **Désaccord** : on retient la valeur la plus prudente (la plus longue, la plus dure), arbitrage daté en commentaire avec les URLs, et exposé à l'utilisateur via `metricsNote` quand il doit le savoir.
4. **Introuvable** : champ absent, jamais 0 ni estimation ; l'écran affiche « non publiée » ou « Topo non chiffré ».
5. **Provenance affichée** : `sources` (noms en texte) en pied de fiche, `trackCredit` sous le plan, URLs complètes en commentaires du fichier de données.

Invariants mécanisés dans `hikes.spec.ts`, chacun parce qu'une erreur réelle est possible :

- ids uniques et sûrs en URL (`/^[a-z0-9-]+$/`) ;
- jointure : chaque `islandId` existe dans `ISLANDS` ;
- cohérence archipel : île des Tuamotu implique dénivelé absent ou ≤ 120 m ;
- bornes plausibles : longueur dans ]0,5 ; 30] km, durée dans [30 ; 720] min, dénivelé ≤ 1 800 m ;
- plausibilité Naismith tropicale (4 km/h à plat, 450 m/h en montée) : quand les trois métriques existent, la durée réelle reste entre 0,7 et 2,0 fois la durée estimée, exemptions (cordes, passages aquatiques) dans un Set d'ids commenté ;
- cohérence du plan : longueur de la polyligne `track` par `haversineKm` dans [0,75 ; 1,25] fois `lengthKm` quand les deux existent ; tracé d'au moins 10 points ; tous les points dans l'emprise de l'île ; boucle implique premier et dernier points proches ;
- sécurité : « très difficile » ou guide obligatoire implique `warnings` non vide ; guide non facultatif implique `guideNote` non vide ;
- `sources` et `trackCredit` non vides, `reviewedOn` en date ISO non future, aucun `http` dans les chaînes livrées.

La relecture humaine ne porte que sur ce que la machine ne peut pas vérifier : re-dériver les durées, contrôler que les cotations n'ont pas été adoucies, vérifier les réglementations à la date du jour, traquer les valeurs rondes suspectes. Revue annuelle avant la saison sèche, corrections en release patch, renommage d'id interdit sans redirection.

## 5. Plan de livraison

3,5 à 4,5 jours en cinq incréments, chacun laissant build et tests verts. Le chemin critique est l'éditorial de l'incrément 1 et la collecte des tracés de l'incrément 2.

| #   | Incrément                     | Contenu                                                                                                                                                                                        | Effort        |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | Socle données                 | `hikes.models.ts`, `hikes.data.ts` avec les 9 fiches Tahiti + presqu'île + Moorea (sources en commentaires), `hikes.spec.ts` complet hors invariants de tracé. PR dédiée, moitié éditoriale.   | 1 j           |
| 2   | Tracés                        | `scripts/make-tracks.js`, collecte OSM des 9 parcours, composant `ta-hike-map` (SVG, échelle, waypoints, crédit), invariants de tracé dans le spec.                                            | 1 j           |
| 3   | Écrans                        | Routes, liste avec filtres et regroupement par île, fiche détail avec plan, entrée home, avertissement permanent.                                                                              | 1 j           |
| 4   | Favoris et liens croisés      | `HikeFavoritesStore`, étoiles, « Mises de côté », carte des îles vers randonnées et retour, lien Soleil et marées.                                                                             | 0,5 j         |
| 5   | Release 1.2.0 puis extensions | Changelog, version minor. Ensuite lots éditoriaux sans code : Société restante, Marquises, Australes et Gambier (avec ajout éventuel de Fatu Hiva, Ua Huka, Makatea, Rimatara dans `ISLANDS`). | 0,5 j par lot |

## 6. Risques

- **Fiabilité des sources** : écarts de 30 à 100 % constatés (Mou'aputa 3,5 à 9 km selon les sources, Trois Cocotiers 4,3 à 7 km). Mitigation : champs optionnels, valeur prudente, `metricsNote`, bornes testées, sources affichées.
- **Licence des tracés** : les traces Wikiloc et AllTrails ne sont pas réutilisables ; OSM est incomplet sur certains sentiers polynésiens. Mitigation : ODbL avec attribution quand OSM couvre, numérisation manuelle assumée sinon, licence Te Fenua à instruire ; l'invariant de cohérence tracé/distance protège contre un tracé fantaisiste.
- **Responsabilité et sécurité** : l'Aorai et le Rotui ont déjà nécessité des secours héliportés. Mitigation testée : warnings obligatoires affichés avant tout, cotations jamais adoucies, plan présenté comme schéma d'orientation et non navigation, avertissement permanent en pied de liste.
- **Obsolescence réglementaire hors ligne** : tarifs et fermetures bougent (Fautaua, Tapioi signalé fermé par des visiteurs récents). Mitigation : `accessNote` formulé en « se renseigner à... », tarifs datés dans le texte, `reviewedOn` affiché, corrections en patch.
- **Surcharge de l'écran de liste** : quatre dimensions de filtre est le maximum raisonnable sur mobile. Repli documenté : fusionner longueur et durée en un filtre « effort » sans toucher au modèle.
- **Dérive de périmètre** (photos, GPX téléchargeable, tuiles, position GPS) : chaque ajout se paie en préchargement iOS ou en fausse promesse de sécurité. Les voies d'ajout sont chiffrées et conditionnées à une décision explicite.

## 7. Questions ouvertes

1. **Bornes du filtre durée** : moins de 3 h / 3 à 5 h / plus de 5 h (retenu), ou moins de 2 h / 2 à 4 h / plus de 4 h, plus adapté aux départs matinaux sous les tropiques ? À trancher avant que les bornes soient testées.
2. **Persistance de l'île choisie** : proposée (l'utilisateur reste plusieurs jours sur la même île), mais ce serait une première, faune et lexique ne persistent aucun filtre. Valider ou retirer.
3. **Filtre sur métrique absente** : l'exclusion honnête est retenue, compensée par « Topo non chiffré ». L'alternative (une rando sans distance passe tous les filtres) reste défendable.
4. **Contacts de guides** en `tel:` cliquables (seul lien autorisé hors ligne, mais les numéros se périment) ou mention « se renseigner à la pension ou au syndicat d'initiative » ?
5. **Waypoints du plan** : combien et lesquels par fiche (départ, sommet, refuge, point d'eau) ? Trop de labels rend le plan illisible sur un écran de téléphone.
6. **Profil altimétrique** : à programmer pour une v1.1 (SRTM, quelques centaines d'octets par fiche) ou à laisser de côté ?
7. **Photos** : lancer la collecte (licences CC vérifiables, calibrage 330 px, environ 450 Ko pour 25 fiches) ou rester durablement sans images ? La contrainte de préchargement iOS rend ce choix structurant.

## Annexe A : inventaire complet vérifié

43 randonnées recensées, statut de la relecture adversariale : confirmé (une source indépendante concorde), corrigé (valeur rectifiée et sourcée), douteux (sources divergentes sans trancher). « nc » : non chiffré dans les sources.

### Société (22)

| Île       | Randonnée                              | Difficulté        | Km      | Durée   | D+    | Guide        | Vérif.                       |
| --------- | -------------------------------------- | ----------------- | ------- | ------- | ----- | ------------ | ---------------------------- |
| Tahiti    | Vallée de la Fautaua (cascade de Loti) | difficile         | 9,8     | 4 h     | +200  | non (billet) | confirmé                     |
| Tahiti    | Mont Aorai (2 066 m)                   | très difficile    | 18      | 9 h     | +1500 | conseillé    | corrigé                      |
| Tahiti    | Antennes du mont Marau                 | moyen             | 17,5    | 6 h     | +960  | non          | confirmé                     |
| Tahiti    | Te Pari (presqu'île)                   | moyen             | ≈9      | 6 h 30  | ≤60   | obligatoire  | corrigé                      |
| Tahiti    | Lavatubes de Hitiaa                    | sportif aquatique | nc      | 5 h     | nc    | obligatoire  | confirmé, hors périmètre     |
| Moorea    | Col des Trois Cocotiers                | facile            | 4,3 à 7 | 2 h 30  | +200  | non          | douteux                      |
| Moorea    | Col des Trois Pinus                    | facile            | 3       | 1 h 30  | +130  | non          | corrigé                      |
| Moorea    | Cascade de la Vaioro                   | facile            | 4,3     | 1 h 30  | +120  | non          | confirmé                     |
| Moorea    | Mont Rotui (899 m)                     | très difficile    | 8       | 6 h     | +900  | conseillé    | confirmé                     |
| Moorea    | Mont Mou'aputa (830 m)                 | très difficile    | 7       | 6 h     | +800  | conseillé    | confirmé                     |
| Raiatea   | Les Trois Cascades (Hamoa)             | moyen             | 5,5     | 3 h     | +200  | obligatoire  | confirmé                     |
| Raiatea   | Plateau Temehani                       | difficile         | 13      | 6 h     | +750  | obligatoire  | confirmé                     |
| Raiatea   | Mont Tapioi (294 m)                    | facile            | 5       | 1 h 30  | +260  | non          | douteux, accès signalé fermé |
| Tahaa     | La traversière Haamene-Patio           | moyen             | 9,3     | 3 h     | +230  | non          | confirmé                     |
| Huahine   | Mont Pohue Rahi (462 m)                | difficile         | 6,5     | 3 h     | +414  | obligatoire  | douteux                      |
| Huahine   | Sentier archéologique de Maeva         | facile            | nc      | 2 h     | nc    | non          | confirmé                     |
| Huahine   | Mont Tapu (belvédère)                  | difficile         | nc      | 2 h 30  | nc    | conseillé    | douteux                      |
| Bora Bora | Mont Ohue                              | difficile         | 5 à 7   | 4 à 5 h | +620  | conseillé    | douteux                      |
| Bora Bora | Mont Pahia (661 m)                     | très difficile    | 7       | 6 h     | +600  | conseillé    | confirmé                     |
| Bora Bora | Pointe Fitiiu et canons                | facile            | 2       | 1 h     | ≈0    | non          | confirmé                     |
| Maupiti   | Mont Teurafaatiu (380 m)               | difficile         | 2,7     | 2 h 30  | +380  | non          | confirmé                     |
| Maupiti   | Tour de l'île à pied                   | facile            | 9,5     | 2 h 30  | ≈0    | non          | confirmé                     |

### Marquises (12)

| Île       | Randonnée                          | Difficulté     | Km   | Durée  | D+   | Guide       | Vérif.                          |
| --------- | ---------------------------------- | -------------- | ---- | ------ | ---- | ----------- | ------------------------------- |
| Nuku Hiva | Cascade de Vaipo (Hakaui)          | moyen          | 9    | 4 h    | +470 | conseillé   | confirmé                        |
| Nuku Hiva | Hatiheu vers baie d'Anaho          | facile         | 9    | 3 h 30 | +390 | non         | confirmé                        |
| Nuku Hiva | Sentier de Tōvi'i (officiel)       | moyen          | 13,2 | 5 h    | nc   | non         | confirmé                        |
| Nuku Hiva | Mont Muake                         | difficile      | nc   | nc     | nc   | conseillé   | douteux, à exclure              |
| Hiva Oa   | Hanaiapa vers Hanatekuua           | moyen          | 10,6 | 4 h    | nc   | non         | confirmé                        |
| Hiva Oa   | Mont Temetiu (1 276 m)             | très difficile | nc   | nc     | nc   | conseillé   | à exclure, non chiffré          |
| Hiva Oa   | Tiki couronné de Moeone            | facile         | nc   | nc     | nc   | obligatoire | à exclure, non chiffré          |
| Ua Pou    | Pic de Poumaka (boucle)            | difficile      | 9    | 4 h 30 | +450 | conseillé   | confirmé                        |
| Ua Pou    | La Traversière Hakahau-Hakahetau   | moyen          | 8,6  | 3 h 30 | +600 | conseillé   | confirmé                        |
| Ua Pou    | Boucle de Hakamoui                 | facile         | 8    | 2 h 30 | nc   | non         | douteux, source unique          |
| Ua Huka   | Plateau et pétroglyphes de Vaikivi | moyen          | nc   | nc     | nc   | conseillé   | douteux, à exclure              |
| Fatu Hiva | Traversée Omoa-Hanavave            | difficile      | 17   | 6 h    | +840 | conseillé   | confirmé, île absente d'ISLANDS |

### Australes, Gambier, Tuamotu (9)

| Île       | Randonnée                              | Difficulté     | Km    | Durée      | D+   | Guide     | Vérif.                         |
| --------- | -------------------------------------- | -------------- | ----- | ---------- | ---- | --------- | ------------------------------ |
| Rurutu    | Mont Manureva                          | facile         | 4,9   | 2 h        | +300 | non       | confirmé                       |
| Rurutu    | Le sentier perdu (côte et grottes)     | très difficile | 2     | 4 h        | +50  | conseillé | confirmé                       |
| Tubuai    | Mont Taita'a par le col de Huahine     | moyen          | 11,2  | 3 h 30     | +417 | non       | confirmé                       |
| Raivavae  | Mont Hiro (438 m)                      | difficile      | 7,4   | 2 à 4 h 30 | +753 | non       | douteux                        |
| Rimatara  | Balades guidées informelles            | facile         | nc    | nc         | nc   | conseillé | à exclure, non formalisé       |
| Mangareva | Mont Duff (Auorotini, 441 m)           | moyen          | 3,3   | 2 h        | +350 | non       | confirmé                       |
| Mangareva | Mont Mokoto                            | moyen          | 3,3   | 2 h        | +330 | non       | confirmé                       |
| Mangareva | La crête de Rikitea                    | moyen          | 4,5   | 2 h 30     | +150 | non       | confirmé                       |
| Makatea   | Traversée marina vers falaise nord-est | moyen          | 13 AR | nc         | nc   | conseillé | corrigé, île absente d'ISLANDS |

Constats négatifs fiables : aucun sentier de randonnée documenté à Rangiroa ni Fakarava (atolls plats), cohérent avec la géographie.

## Annexe B : sources détaillées par randonnée

Consultées et recoupées en août 2026. Destinées aux commentaires de `hikes.data.ts` ; à l'écran, seuls les noms de sources apparaissent (champ `sources`).

### Tahiti

- **Vallée de la Fautaua** : tahiti-rando.fr/rando-tahiti-vallee-fautaua.php · ville-papeete.pf/articles.php?id=300 (billet 600 XPF) · blog-trotting.fr/voyage/polynesie-francaise/9130-randonnee-a-la-fautaua
- **Mont Aorai** : tahiti-rando.fr/rando-tahiti-mont-aorai.php · todotahiti.com/mont-aorai · iaorana.com/quefaire/le-mont-aroai (guide non obligatoire recoupé par tahitileblog.fr, randozone, outdooractive)
- **Mont Marau** : tahiti-rando.fr/rando-tahiti-mont-marau.php · iaorana.com/quefaire/le-mont-marau
- **Te Pari** : tahitirevatrek.com/activities/te-pari-a-la-journee · todotahiti.com/te-pari-site-culturel · wikiloc.com/hiking-trails/tahiti-te-pari-58031176 (distance ≈9 km recoupée par tahitisuntours.com, guide obligatoire recoupé par iles-polynesie.fr et tahititourisme.fr)
- **Lavatubes de Hitiaa** (hors périmètre) : anoe-tahiti.com · tahitirevatrek.com/activities/les-lavatubes · tetoahiking.com

### Moorea

- **Col des Trois Cocotiers** : tahiti-rando.fr/rando-moorea-opunohu.php · denivpositif.com/col-des-3-cocotiers · tahiti-infos.com (article A134788) · decathlon-outdoor.com (désaccord 4,3 à 7 km documenté)
- **Col des Trois Pinus** : tahiti-rando.fr/rando-moorea-opunohu.php · denivpositif.com/col-des-3-pinus (3 km, +129 m, correction du dénivelé) · openrunner.com (variante 1,8 km)
- **Cascade de la Vaioro** : tahiti-rando.fr/rando-moorea-cascade-vaioro.php
- **Mont Rotui** : alltrails.com/trail/french-polynesia/tahiti/mount-rotui-depuis-faimano · polynesie.liliguide.com (randonnee-mont-rotui-moorea) · wikiloc.com/hiking-trails/mont-rotui-a-moorea-17933746
- **Mont Mou'aputa** : alltrails.com/trail/french-polynesia/moorea/mou-aputa · moanavoyages.com (blog mont Moua Puta) · manawa.com (activité 17717)

### Autres îles (extensions)

- **Raiatea** : Trois Cascades : tahiti-rando.fr, moanavoyages.com. Temehani : pacifique-a-la-carte.com, service-public.pf/diren (PDF Temehani), tahititourisme.fr, cbnbrest.fr (tiare apetahi). Tapioi : calculitineraires.fr (id 650251), wikiloc.com, tripadvisor.com (fermeture signalée, à vérifier).
- **Tahaa** : traversière : tahiti-rando.fr, openrunner.com (route 11696466), blog-trotting.fr.
- **Huahine** : Pohue Rahi : tahititourisme.fr/randonnee/pohue-rahi, fr.wikiloc.com (162776768), vialala.com (désaccord durée). Maeva : tahititourisme.fr, farepotee-maevahuahine.com, tahitiheritage.pf. Mont Tapu : polynesiaparadise.com, Lonely Planet et wikiloc en divergence.
- **Bora Bora** : Ohue : tahiti-rando.fr, decathlon-outdoor.com (désaccord 5,1 à 6,9 km). Pahia : tahititourisme.fr, tahiti-rando.fr, polynesiaparadise.com. Pointe Fitiiu : bora-bora-insider.com, polynesiaparadise.com.
- **Maupiti** : Teurafaatiu : tahiti-rando.fr, decathlon-outdoor.com. Tour de l'île : manweodyssey.com, onmetlesvoiles.com, levoyagedanstouscesetats.fr (9 à 10,6 km selon sources).
- **Nuku Hiva** : Vaipo : alltrails.com, tahitiheritage.pf, tahititourisme.fr, spc.pf, nohomai.com. Hatiheu-Anaho : alltrails.com, tahititourisme.pf, wikiloc.com. Tōvi'i : service-public.pf/sdt/sentier-de-tvii (fiche officielle), tahititourisme.fr, sitytrail.com. Muake (exclu) : nohomai.com, evasion-polynesie.com.
- **Hiva Oa** : Hanatekuua : hivaoalocation.com/randonnees, alltrails.com, wikiloc.com. Temetiu (exclu) : comptoirdesvoyages.fr, fr.wikipedia.org, temetiuvillage.com. Tiki de Moeone (exclu) : hivaoalocation.com.
- **Ua Pou** : Poumaka : pensionpukuee.com, wikiloc.com (108338711), tahiti-infos.com (a200257), petitfute.com. Traversière et Hakamoui : pensionpukuee.com (source unique pour Hakamoui, signalé).
- **Ua Huka** (exclu) : tahititourisme.com, tahititourisme.pf.
- **Fatu Hiva** : alltrails.com (omoa-to-hanavave), dreamfirst.fr, blog-trotting.fr, lostbetweenoceans.com.
- **Rurutu** : Manureva : tahiti-rando.fr, wikiloc.com (83180022), openrunner.com (12169748). Sentier perdu : tahiti-rando.fr.
- **Tubuai** : visugpx.com (d8ieBZ5MWI), tahititourisme.fr, wikiloc.com (62601971), 3chatonsenvadrouille.fr.
- **Raivavae** : alltrails.com (mont-hiro), tahitiheritage.pf, tahiti-infos.com (a139396), wikiloc.com (14660244), mylittlepolynesia.com (désaccord durée 2 à 4 h 30).
- **Rimatara** (exclu) : mellovestravels.com, blog.vivre-en-polynesie.com, mylittlepolynesia.com.
- **Mangareva** : Duff : tahiti-rando.fr, wikiloc.com (61286657). Mokoto : tahiti-rando.fr, tahititourisme.com. Crête de Rikitea : tahiti-rando.fr.
- **Makatea** : polynesie.liliguide.com, aventure-zaizai.fr, fanatic-climbing.com, la1ere.franceinfo.fr (13 km aller-retour recoupé par intothewind.fr et kermotu.com).
