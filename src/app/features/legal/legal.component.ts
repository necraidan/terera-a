import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

interface SourceEntry {
  readonly tool: string;
  readonly text: string;
}

/**
 * Sources et licences par outil. Texte plutôt que liens : la page doit se
 * lire hors ligne, et les URLs précises vivent en commentaires des fichiers
 * de données correspondants (voir shared/data).
 */
const SOURCES: readonly SourceEntry[] = [
  {
    tool: 'Convertisseur',
    text: 'Parité fixe légale du franc pacifique (1 € = 119,331742 F), fixée par l’accord monétaire de la zone euro et l’Institut d’émission d’outre-mer (IEOM).',
  },
  {
    tool: 'Billets et pièces',
    text: 'Caractéristiques de la série en cours publiées par l’IEOM. Photographies : IEOM (domaine public) et Jonathanischoice (CC BY 4.0 et CC0), via Wikimedia Commons. Les crédits sont rappelés sous chaque image.',
  },
  {
    tool: 'Heure',
    text: 'Fuseaux horaires de la base IANA, tels qu’embarqués dans le navigateur (Intl). Pas de calcul maison.',
  },
  {
    tool: 'Unités',
    text: 'Facteurs de conversion exacts issus des définitions du Système international et des unités nautiques (mille marin de 1 852 m).',
  },
  {
    tool: 'Soleil et marées',
    text: 'Lever et coucher calculés localement avec l’algorithme solaire de la NOAA (Global Monitoring Laboratory). Régimes de marée d’après la littérature océanographique publique ; ils ne remplacent ni l’annuaire du SHOM ni les instructions nautiques.',
  },
  {
    tool: 'Carte et distances',
    text: 'Coordonnées des îles issues de références géographiques publiques ; distances et caps dérivés par calcul. Traits de côte dérivés des « land polygons » d’OpenStreetMap, © contributeurs d’OpenStreetMap, licence ODbL.',
  },
  {
    tool: 'Faune marine',
    text: 'Fiches établies à partir de la réglementation polynésienne (Code de l’environnement, sanctuaire des mammifères marins, DIREN, direction des ressources marines) et de la littérature naturaliste. Photographies sous licences Creative Commons via Wikimedia Commons, auteur et licence indiqués sous chaque photo.',
  },
  {
    tool: 'Randonnées',
    text: 'Métriques recoupées entre topo-guides et récits publics (tahiti-rando.fr, todotahiti.com, iaorana.com, denivpositif.com, tahitirevatrek.com, etc.), nommés au pied de chaque fiche avec la date de vérification. Tracés et fonds de plan d’après les contributeurs d’OpenStreetMap, licence ODbL.',
  },
  {
    tool: 'Lexique',
    text: 'Reo tahiti d’après les dictionnaires de l’Académie tahitienne (Fare Vāna’a) et les usages courants ; toponymes d’après les références officielles.',
  },
  {
    tool: 'Infos pratiques',
    text: 'Numéros d’urgence, indicatif, électricité et jours fériés d’après les sites du gouvernement de la Polynésie française et du Haut-commissariat.',
  },
  {
    tool: 'Liens utiles',
    text: 'Sélection de sites officiels ou pérennes, vérifiés un par un. Terera’a n’est affilié à aucun d’eux.',
  },
];

@Component({
  selector: 'ta-legal',
  imports: [PageHeaderComponent],
  template: `
    <ta-page-header title="Mentions légales" width="prose" />

    <main class="page-prose pb-28 text-sm leading-relaxed text-ink-2">
      <section class="rounded-card bg-surface-1 p-4">
        <h2 class="font-semibold text-ink-1">Éditeur</h2>
        <p class="mt-1">
          Terera’a est un projet personnel, sans but commercial, édité par necraidan. Contact via le
          dépôt du code source (GitHub, necraidan/terera-a). Le code est publié ouvertement ; le
          contenu éditorial reste la propriété de ses auteurs et sources respectifs.
        </p>

        <h2 class="mt-5 font-semibold text-ink-1">Hébergement</h2>
        <p class="mt-1">
          Site statique hébergé par GitHub Pages (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San
          Francisco, CA 94107, États-Unis).
        </p>

        <h2 class="mt-5 font-semibold text-ink-1">Données personnelles</h2>
        <p class="mt-1">
          Aucune donnée n’est collectée, aucun cookie ni traceur n’est déposé, aucune mesure
          d’audience n’est effectuée. Vos favoris et réglages sont conservés uniquement sur votre
          appareil (stockage local du navigateur) et ne sont jamais transmis. Aucune autorisation
          (position, caméra…) n’est demandée.
        </p>

        <h2 class="mt-5 font-semibold text-ink-1">Avertissement</h2>
        <p class="mt-1">
          Les informations sont fournies à titre indicatif, vérifiées avec soin mais sans garantie.
          Les plans de randonnée sont des schémas d’orientation et non des outils de navigation ;
          les heures de soleil et les régimes de marée ne remplacent pas les documents nautiques
          officiels. Chacun reste responsable de ses décisions sur le terrain et en mer.
        </p>
      </section>

      <h2 id="sources" class="mt-8 mb-2 text-sm font-semibold tracking-wide uppercase">
        Sources des données
      </h2>
      <ul class="overflow-hidden rounded-card bg-surface-1">
        @for (entry of sources; track entry.tool) {
          <li class="border-b border-surface-2 p-4 last:border-b-0">
            <h3 class="font-semibold text-ink-1">{{ entry.tool }}</h3>
            <p class="mt-1">{{ entry.text }}</p>
          </li>
        }
      </ul>

      <h2 class="mt-8 mb-2 text-sm font-semibold tracking-wide uppercase">Licences</h2>
      <div class="rounded-card bg-surface-1 p-4">
        <p>
          Les données OpenStreetMap sont disponibles sous Open Database License (ODbL) : ©
          contributeurs d’OpenStreetMap. Les photographies sont reproduites selon la licence
          indiquée sous chacune (Creative Commons ou domaine public). Le nom « Terera’a » et
          l’interface sont la création de l’éditeur.
        </p>
        <p class="mt-3">
          Une erreur, une source manquante ? Ouvrez un ticket sur le dépôt GitHub du projet.
        </p>
      </div>
    </main>
  `,
})
export class LegalComponent {
  protected readonly sources = SOURCES;
}
