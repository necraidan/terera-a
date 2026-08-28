import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HikeFavoritesStore } from '../../shared/data/favorites.store';
import { HIKES, HIKE_DISCLAIMER } from '../../shared/data/hikes.data';
import {
  DIFFICULTY_CLASSES,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  DURATION_LABELS,
  DURATION_ORDER,
  DurationBucket,
  GUIDE_LABELS,
  Hike,
  HikeDifficulty,
  LENGTH_LABELS,
  LENGTH_ORDER,
  LengthBucket,
  formatDuration,
  formatElevation,
  formatHikeKm,
  matchesDuration,
  matchesLength,
} from '../../shared/data/hikes.models';
import { ISLANDS } from '../../shared/data/islands.data';
import { readStored, writeStored } from '../../shared/data/storage';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { QuickChipComponent } from '../../shared/ui/quick-chip.component';

/**
 * L'île choisie survit à la session : on reste plusieurs jours sur la même île,
 * et rouvrir l'écran sur « toutes les îles » obligerait à refiltrer chaque fois.
 * Les trois autres filtres repartent à zéro à chaque visite, pour ne jamais
 * masquer des randonnées à l'insu de l'utilisateur des jours plus tard.
 */
const ISLAND_STORAGE_KEY = 'hikes:island';

interface Group {
  readonly islandId: string;
  readonly title: string;
  readonly hikes: readonly Hike[];
}

@Component({
  selector: 'ta-hikes',
  imports: [RouterLink, PageHeaderComponent, QuickChipComponent],
  template: `
    <ta-page-header width="wide" title="Randonnées" />

    <main class="page-wide pb-28">
      <label class="block text-sm font-medium text-ink-2" for="hike-island">Île</label>
      <select
        id="hike-island"
        class="mt-1 w-full rounded-lg bg-surface-1 px-3 py-3 text-lg outline-none"
        [value]="island() ?? ''"
        (change)="onIsland($event)"
      >
        <option value="">Toutes les îles</option>
        @for (option of islandOptions(); track option.id) {
          <option [value]="option.id">{{ option.name }} ({{ option.count }})</option>
        }
      </select>

      <p class="mt-4 text-xs font-medium tracking-wide text-ink-2 uppercase">Difficulté</p>
      <div class="-mx-4 mt-1 flex gap-2 overflow-x-auto px-4 pb-1">
        <ta-quick-chip
          label="Toutes"
          [selected]="difficulty() === null"
          (picked)="difficulty.set(null)"
        />
        @for (level of difficultyOrder; track level) {
          <ta-quick-chip
            [label]="difficultyLabels[level]"
            [selected]="difficulty() === level"
            (picked)="difficulty.set(level)"
          />
        }
      </div>

      <p class="mt-3 text-xs font-medium tracking-wide text-ink-2 uppercase">Longueur</p>
      <div class="-mx-4 mt-1 flex gap-2 overflow-x-auto px-4 pb-1">
        <ta-quick-chip label="Toutes" [selected]="length() === null" (picked)="length.set(null)" />
        @for (bucket of lengthOrder; track bucket) {
          <ta-quick-chip
            [label]="lengthLabels[bucket]"
            [selected]="length() === bucket"
            (picked)="length.set(bucket)"
          />
        }
      </div>

      <p class="mt-3 text-xs font-medium tracking-wide text-ink-2 uppercase">Durée</p>
      <div class="-mx-4 mt-1 flex gap-2 overflow-x-auto px-4 pb-1">
        <ta-quick-chip
          label="Toutes"
          [selected]="duration() === null"
          (picked)="duration.set(null)"
        />
        @for (bucket of durationOrder; track bucket) {
          <ta-quick-chip
            [label]="durationLabels[bucket]"
            [selected]="duration() === bucket"
            (picked)="duration.set(bucket)"
          />
        }
      </div>

      <div class="mt-4 flex items-baseline justify-between gap-3">
        <p class="text-sm text-ink-2">{{ countLabel() }}</p>
        @if (filtered()) {
          <button type="button" class="min-h-11 text-sm font-medium text-accent" (click)="reset()">
            Réinitialiser
          </button>
        }
      </div>

      @if (visible().length === 0) {
        <p class="mt-8 text-center text-ink-2">Aucune randonnée ne correspond à ces critères.</p>
      }

      @for (group of groups(); track group.islandId) {
        @if (group.title) {
          <h2 class="mt-8 mb-2 text-sm font-semibold tracking-wide text-ink-2 uppercase">
            {{ group.title }}
          </h2>
        }
        <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          @for (hike of group.hikes; track hike.id) {
            <li class="flex">
              <div class="flex min-w-0 flex-1 rounded-card bg-surface-1">
                <a
                  [routerLink]="['/randonnees', hike.id]"
                  class="min-w-0 flex-1 rounded-card p-4 active:bg-surface-2"
                >
                  <span class="flex items-start justify-between gap-2">
                    <span class="min-w-0 font-semibold">{{ hike.name }}</span>
                    <span
                      class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                      [class]="difficultyClasses[hike.difficulty]"
                    >
                      {{ difficultyLabels[hike.difficulty] }}
                    </span>
                  </span>
                  <span class="mt-1 block text-sm text-ink-2">{{ islandName(hike) }}</span>
                  <span class="mt-2 block text-sm tabular-nums">{{ metrics(hike) }}</span>
                  @if (hike.guide !== 'facultatif') {
                    <span class="mt-2 inline-block text-xs font-medium text-coral">
                      {{ guideLabels[hike.guide] }}
                    </span>
                  }
                </a>
                <button
                  type="button"
                  class="grid size-11 shrink-0 place-items-center self-start rounded-full text-2xl"
                  [class]="favorites.has(hike.id) ? 'text-coral' : 'text-ink-2 opacity-40'"
                  [attr.aria-label]="
                    (favorites.has(hike.id) ? 'Retirer des favoris : ' : 'Ajouter aux favoris : ') +
                    hike.name
                  "
                  [attr.aria-pressed]="favorites.has(hike.id)"
                  (click)="favorites.toggle(hike.id)"
                >
                  {{ favorites.has(hike.id) ? '★' : '☆' }}
                </button>
              </div>
            </li>
          }
        </ul>
      }

      <section class="mt-8 rounded-card bg-surface-2 p-4">
        <h2 class="font-semibold">Avant de partir</h2>
        <ul class="mt-2 grid gap-2">
          @for (rule of disclaimer; track $index) {
            <li class="flex gap-2 text-sm leading-relaxed">
              <span class="text-coral" aria-hidden="true">•</span>
              <span>{{ rule }}</span>
            </li>
          }
        </ul>
      </section>
    </main>
  `,
})
export class HikesComponent {
  /** Query param `?ile=`, alimenté par `withComponentInputBinding()`. */
  readonly ile = input<string>();

  protected readonly favorites = inject(HikeFavoritesStore);

  protected readonly difficultyLabels = DIFFICULTY_LABELS;
  protected readonly difficultyClasses = DIFFICULTY_CLASSES;
  protected readonly difficultyOrder = DIFFICULTY_ORDER;
  protected readonly lengthLabels = LENGTH_LABELS;
  protected readonly lengthOrder = LENGTH_ORDER;
  protected readonly durationLabels = DURATION_LABELS;
  protected readonly durationOrder = DURATION_ORDER;
  protected readonly guideLabels = GUIDE_LABELS;
  protected readonly disclaimer = HIKE_DISCLAIMER;

  /**
   * Le lien depuis la carte des îles impose son île, puis l'utilisateur reste
   * libre d'en changer : d'où `linkedSignal` plutôt qu'un simple `computed`.
   */
  protected readonly island = linkedSignal<string | null>(
    () => this.ile() ?? restoreIsland() ?? null,
  );

  protected readonly difficulty = signal<HikeDifficulty | null>(null);
  protected readonly length = signal<LengthBucket | null>(null);
  protected readonly duration = signal<DurationBucket | null>(null);

  constructor() {
    effect(() => writeStored(ISLAND_STORAGE_KEY, this.island() ?? ''));
  }

  /** Seules les îles qui ont au moins une randonnée, dans l'ordre d'ISLANDS. */
  protected readonly islandOptions = computed(() =>
    ISLANDS.map((island) => ({
      id: island.id,
      name: island.name,
      count: HIKES.filter((hike) => hike.islandId === island.id).length,
    })).filter((option) => option.count > 0),
  );

  protected readonly visible = computed(() =>
    HIKES.filter((hike) => {
      const island = this.island();
      const difficulty = this.difficulty();
      const length = this.length();
      const duration = this.duration();

      return (
        (island === null || hike.islandId === island) &&
        (difficulty === null || hike.difficulty === difficulty) &&
        (length === null || matchesLength(hike, length)) &&
        (duration === null || matchesDuration(hike, duration))
      );
    }),
  );

  /**
   * Les randonnées épinglées forment un premier groupe et quittent celui de leur
   * île : les voir deux fois coûterait plus de défilement que ça n'aiderait,
   * comme sur la page Liens.
   */
  protected readonly groups = computed<readonly Group[]>(() => {
    const visible = this.visible();
    const pinned = visible.filter((hike) => this.favorites.has(hike.id));
    const rest = visible.filter((hike) => !this.favorites.has(hike.id));

    const groups: Group[] = [];
    if (pinned.length > 0) {
      groups.push({ islandId: 'favoris', title: 'Mises de côté', hikes: sortHikes(pinned) });
    }

    if (this.island() !== null) {
      // Une île sélectionnée : le titre serait redondant avec le select.
      if (rest.length > 0) {
        groups.push({ islandId: this.island() ?? '', title: '', hikes: sortHikes(rest) });
      }
      return groups;
    }

    for (const island of ISLANDS) {
      const hikes = rest.filter((hike) => hike.islandId === island.id);
      if (hikes.length > 0) {
        groups.push({ islandId: island.id, title: island.name, hikes: sortHikes(hikes) });
      }
    }
    return groups;
  });

  protected readonly countLabel = computed(() => {
    const count = this.visible().length;
    return count === 1 ? '1 randonnée' : `${count} randonnées`;
  });

  protected readonly filtered = computed(
    () =>
      this.island() !== null ||
      this.difficulty() !== null ||
      this.length() !== null ||
      this.duration() !== null,
  );

  protected islandName(hike: Hike): string {
    return ISLANDS.find((island) => island.id === hike.islandId)?.name ?? '';
  }

  /** Ne montre que ce qui est publié : « topo non chiffré » plutôt qu'un zéro. */
  protected metrics(hike: Hike): string {
    const parts: string[] = [];
    if (hike.lengthKm !== undefined) {
      parts.push(formatHikeKm(hike.lengthKm));
    }
    if (hike.durationMin !== undefined) {
      parts.push(formatDuration(hike.durationMin));
    }
    if (hike.elevationGainM !== undefined) {
      parts.push(`+${formatElevation(hike.elevationGainM)}`);
    }
    return parts.length > 0 ? parts.join(' · ') : 'Topo non chiffré';
  }

  protected onIsland(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.island.set(value === '' ? null : value);
  }

  protected reset(): void {
    this.island.set(null);
    this.difficulty.set(null);
    this.length.set(null);
    this.duration.set(null);
  }
}

/** L'île retenue n'est restaurée que si elle a encore des randonnées. */
function restoreIsland(): string | null {
  const stored = readStored(ISLAND_STORAGE_KEY);
  if (stored === null || stored === '') {
    return null;
  }
  return HIKES.some((hike) => hike.islandId === stored) ? stored : null;
}

/** Du plus accessible au plus engagé, puis du plus court au plus long. */
function sortHikes(hikes: readonly Hike[]): readonly Hike[] {
  return [...hikes].sort((a, b) => {
    const byDifficulty =
      DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty);
    return byDifficulty !== 0
      ? byDifficulty
      : (a.durationMin ?? Number.MAX_SAFE_INTEGER) - (b.durationMin ?? Number.MAX_SAFE_INTEGER);
  });
}
