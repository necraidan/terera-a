import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HikeFavoritesStore } from '../../shared/data/favorites.store';
import { HIKE_BASEMAPS, ISLAND_OUTLINES } from '../../shared/data/hikes.basemap';
import { HIKES } from '../../shared/data/hikes.data';
import {
  DIFFICULTY_CLASSES,
  DIFFICULTY_LABELS,
  GUIDE_LABELS,
  KIND_LABELS,
  formatDuration,
  formatElevation,
  formatHikeKm,
} from '../../shared/data/hikes.models';
import { HIKE_TRACKS } from '../../shared/data/hikes.tracks';
import { ARCHIPELAGOS, ISLANDS } from '../../shared/data/islands.data';
import { HikeMapComponent } from '../../shared/ui/hike-map.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'ta-hike-detail',
  imports: [RouterLink, PageHeaderComponent, HikeMapComponent],
  template: `
    <ta-page-header
      width="wide"
      [title]="hike()?.name ?? 'Randonnée introuvable'"
      backTo="/randonnees"
      backLabel="Retour aux randonnées"
    />

    <main class="page-wide">
      @let current = hike();

      @if (current) {
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded-full px-2 py-0.5 text-xs font-semibold"
            [class]="difficultyClasses[current.difficulty]"
          >
            {{ difficultyLabels[current.difficulty] }}
          </span>
          <span class="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold">
            {{ kindLabels[current.kind] }}
          </span>
          @if (current.guide !== 'facultatif') {
            <span class="rounded-full bg-coral px-2 py-0.5 text-xs font-semibold text-surface-1">
              {{ guideLabels[current.guide] }}
            </span>
          }
          <button
            type="button"
            class="ml-auto grid size-11 shrink-0 place-items-center rounded-full text-2xl"
            [class]="favorites.has(current.id) ? 'text-coral' : 'text-ink-2 opacity-40'"
            [attr.aria-label]="
              (favorites.has(current.id) ? 'Retirer des favoris : ' : 'Ajouter aux favoris : ') +
              current.name
            "
            [attr.aria-pressed]="favorites.has(current.id)"
            (click)="favorites.toggle(current.id)"
          >
            {{ favorites.has(current.id) ? '★' : '☆' }}
          </button>
        </div>

        <p class="mt-2 text-sm text-ink-2">{{ place() }}</p>

        @if (current.image) {
          <figure class="mt-3">
            <img
              [src]="current.image"
              [alt]="current.name"
              width="660"
              height="440"
              class="aspect-[3/2] w-full rounded-card object-cover"
            />
            <figcaption class="mt-1 text-xs text-ink-2">
              Photo : {{ current.photoCredit }}.
            </figcaption>
          </figure>
        }

        @if (current.warnings.length > 0) {
          <section class="mt-3 rounded-card border border-danger/40 bg-surface-1 p-4">
            <h2 class="font-semibold text-danger">⚠️ À savoir avant de s’engager</h2>
            <ul class="mt-2 grid gap-2">
              @for (warning of current.warnings; track $index) {
                <li class="flex gap-2 text-sm leading-relaxed">
                  <span class="text-danger" aria-hidden="true">•</span>
                  <span>{{ warning }}</span>
                </li>
              }
            </ul>
          </section>
        }

        <div class="mt-3 gap-x-3 lg:columns-2">
          @if (current.guideNote) {
            <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
              <h2 class="font-semibold">🧭 {{ guideLabels[current.guide] }}</h2>
              <p class="mt-1 text-sm leading-relaxed">{{ current.guideNote }}</p>
            </section>
          }

          @if (current.accessNote) {
            <section class="mb-3 rounded-card bg-surface-2 p-4 break-inside-avoid">
              <h2 class="font-semibold">🔑 Accès</h2>
              <p class="mt-1 text-sm leading-relaxed">{{ current.accessNote }}</p>
            </section>
          }

          @let currentTrack = track();

          <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
            <h2 class="font-semibold">🗺️ Le parcours</h2>
            @if (currentTrack && current.trackCoverage) {
              <div class="mt-2">
                <ta-hike-map
                  [track]="currentTrack"
                  [waypoints]="current.waypoints ?? []"
                  [coverage]="current.trackCoverage"
                  [name]="current.name"
                  [basemap]="basemap()"
                  [outline]="outline()"
                />
              </div>
            } @else {
              <p class="mt-1 text-sm leading-relaxed text-ink-2">
                Aucun tracé disponible : ce sentier n’est pas cartographié dans les données
                ouverteset dessiner une ligne approximative serait trompeur.
              </p>
            }
          </section>

          <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
            <h2 class="font-semibold">📏 En chiffres</h2>
            <dl class="mt-2 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <div class="flex justify-between gap-2 sm:block">
                <dt class="text-ink-2">Distance</dt>
                <dd class="font-semibold tabular-nums">{{ lengthLabel() }}</dd>
              </div>
              <div class="flex justify-between gap-2 sm:block">
                <dt class="text-ink-2">Durée de marche</dt>
                <dd class="font-semibold tabular-nums">{{ durationLabel() }}</dd>
              </div>
              <div class="flex justify-between gap-2 sm:block">
                <dt class="text-ink-2">Dénivelé positif</dt>
                <dd class="font-semibold tabular-nums">{{ elevationLabel() }}</dd>
              </div>
            </dl>
            @if (current.metricsNote) {
              <p class="mt-3 text-sm leading-relaxed text-ink-2">
                <span class="font-semibold">Selon les sources :</span>
                {{ current.metricsNote }}
              </p>
            }
          </section>

          <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
            <h2 class="font-semibold">👀 À voir</h2>
            <p class="mt-1 text-sm leading-relaxed text-ink-2">{{ current.summary }}</p>
            <ul class="mt-2 grid gap-2">
              @for (highlight of current.highlights; track $index) {
                <li class="flex gap-2 text-sm leading-relaxed">
                  <span class="text-accent" aria-hidden="true">•</span>
                  <span>{{ highlight }}</span>
                </li>
              }
            </ul>
          </section>

          <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
            <h2 class="font-semibold">🎒 Conseils</h2>
            <ul class="mt-2 grid gap-2">
              @for (advice of current.advice; track $index) {
                <li class="flex gap-2 text-sm leading-relaxed">
                  <span class="text-accent" aria-hidden="true">•</span>
                  <span>{{ advice }}</span>
                </li>
              }
            </ul>
            <p class="mt-3 text-sm">
              <a routerLink="/soleil-marees" class="font-medium text-accent">
                Voir l’heure du lever du soleil ›
              </a>
            </p>
          </section>
        </div>

        <p class="mt-6 text-xs leading-relaxed text-ink-2">
          D’après {{ current.sources.join(', ') }}. Vérifié le {{ reviewedLabel() }}. Les cotations
          varient d’une source à l’autre : en cas de doute, la valeur la plus prudente a été
          retenue.
        </p>
        <p class="mt-2 text-sm">
          <a [routerLink]="['/carte']" class="font-medium text-accent">
            Voir {{ islandName() }} sur la carte ›
          </a>
        </p>
      } @else {
        <p class="text-ink-2">Cette randonnée n’existe pas dans le guide.</p>
      }
    </main>
  `,
})
export class HikeDetailComponent {
  /** Alimenté par le paramètre de route grâce à `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  protected readonly favorites = inject(HikeFavoritesStore);

  protected readonly difficultyLabels = DIFFICULTY_LABELS;
  protected readonly difficultyClasses = DIFFICULTY_CLASSES;
  protected readonly kindLabels = KIND_LABELS;
  protected readonly guideLabels = GUIDE_LABELS;

  protected readonly hike = computed(() => HIKES.find((hike) => hike.id === this.id()));

  protected readonly track = computed(() => {
    const current = this.hike();
    return current ? HIKE_TRACKS[current.id] : undefined;
  });

  protected readonly basemap = computed(() => {
    const current = this.hike();
    return current ? HIKE_BASEMAPS[current.id] : undefined;
  });

  protected readonly outline = computed(() => {
    const islandId = this.hike()?.islandId;
    return islandId ? ISLAND_OUTLINES[islandId] : undefined;
  });

  private readonly island = computed(() =>
    ISLANDS.find((island) => island.id === this.hike()?.islandId),
  );

  protected readonly islandName = computed(() => this.island()?.name ?? 'l’île');

  protected readonly place = computed(() => {
    const island = this.island();
    if (!island) {
      return '';
    }
    const archipelago = ARCHIPELAGOS.find((item) => item.id === island.archipelagoId);
    return archipelago ? `${island.name}, ${archipelago.shortName}` : island.name;
  });

  /** Un chiffre absent est dit absent, jamais masqué ni remplacé par un zéro. */
  protected readonly lengthLabel = computed(() => {
    const km = this.hike()?.lengthKm;
    return km === undefined ? 'non publiée' : formatHikeKm(km);
  });

  protected readonly durationLabel = computed(() => {
    const minutes = this.hike()?.durationMin;
    return minutes === undefined ? 'non publiée' : formatDuration(minutes);
  });

  protected readonly elevationLabel = computed(() => {
    const metres = this.hike()?.elevationGainM;
    return metres === undefined ? 'non publié' : formatElevation(metres);
  });

  protected readonly reviewedLabel = computed(() => {
    const iso = this.hike()?.reviewedOn;
    if (!iso) {
      return '';
    }
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(iso));
  });
}
