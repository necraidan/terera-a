import { Component, computed, signal } from '@angular/core';
import { ARCHIPELAGOS, ISLANDS } from '../../shared/data/islands.data';
import { Island } from '../../shared/data/islands.models';
import { formatDuration, formatSolarTime, sunTimes } from '../../shared/data/solar';
import { readStored, writeStored } from '../../shared/data/storage';
import { PAPEETE_HARMONICS, TIDE_LIMITS, tideGuidanceFor } from '../../shared/data/tides.data';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

const ISLAND_KEY = 'sea:island';

/** Décalage de la date affichée, en jours, par rapport à aujourd'hui. */
const MAX_DAY_OFFSET = 180;

@Component({
  selector: 'ta-sea',
  imports: [PageHeaderComponent],
  template: `
    <ta-page-header width="wide" title="Soleil et marées" />

    <main class="page-wide pb-28">
      <div class="max-w-lg">
        <label class="block text-sm font-medium text-ink-2" for="island">Île</label>
        <select
          id="island"
          class="mt-1 w-full rounded-lg bg-surface-1 px-3 py-3 text-lg outline-none"
          [value]="island().id"
          (change)="onIsland($event)"
        >
          @for (group of grouped(); track group.id) {
            <optgroup [label]="group.name">
              @for (item of group.islands; track item.id) {
                <option [value]="item.id">{{ label(item) }}</option>
              }
            </optgroup>
          }
        </select>

        <div class="mt-3 flex items-center gap-2">
          <button
            type="button"
            class="grid size-11 shrink-0 place-items-center rounded-full bg-surface-1 text-lg active:bg-surface-2"
            aria-label="Jour précédent"
            (click)="shiftDay(-1)"
          >
            ‹
          </button>
          <p class="flex-1 text-center text-sm font-medium capitalize">{{ dateLabel() }}</p>
          <button
            type="button"
            class="grid size-11 shrink-0 place-items-center rounded-full bg-surface-1 text-lg active:bg-surface-2"
            aria-label="Jour suivant"
            (click)="shiftDay(1)"
          >
            ›
          </button>
        </div>
        @if (dayOffset() !== 0) {
          <button
            type="button"
            class="mt-2 w-full text-center text-sm text-accent underline underline-offset-2"
            (click)="dayOffset.set(0)"
          >
            Revenir à aujourd’hui
          </button>
        }
      </div>

      <div class="mt-4 gap-x-3 lg:columns-2">
        <section class="mb-3 rounded-card bg-accent p-4 break-inside-avoid text-accent-ink">
          <h2 class="text-sm font-medium opacity-80">☀️ Le soleil</h2>
          <div class="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs opacity-80">Lever</p>
              <p class="text-3xl font-bold tabular-nums">{{ sun().sunrise }}</p>
            </div>
            <div>
              <p class="text-xs opacity-80">Coucher</p>
              <p class="text-3xl font-bold tabular-nums">{{ sun().sunset }}</p>
            </div>
          </div>
          <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div class="flex justify-between gap-2">
              <dt class="opacity-80">Première lueur</dt>
              <dd class="font-semibold tabular-nums">{{ sun().dawn }}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="opacity-80">Nuit noire</dt>
              <dd class="font-semibold tabular-nums">{{ sun().dusk }}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="opacity-80">Midi solaire</dt>
              <dd class="font-semibold tabular-nums">{{ sun().noon }}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="opacity-80">Durée du jour</dt>
              <dd class="font-semibold tabular-nums">{{ sun().dayLength }}</dd>
            </div>
          </dl>
          <p class="mt-4 text-xs opacity-80">
            Calculé sur place pour {{ island().place ?? island().name }}, sans connexion. Le
            crépuscule est court sous ces latitudes : comptez 21 à 25 minutes entre le coucher et la
            nuit civile.
          </p>
        </section>

        <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
          <h2 class="font-semibold">🌊 La marée</h2>
          <p class="mt-1 text-sm text-ink-2">{{ tide().summary }}</p>

          @if (tide().regime === 'solaire') {
            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-lg bg-surface-2 p-3">
                <p class="text-xs text-ink-2">Pleine mer vers</p>
                <p class="text-xl font-bold tabular-nums">
                  {{ tide().highTideHours.join(' et ') }}
                </p>
              </div>
              <div class="rounded-lg bg-surface-2 p-3">
                <p class="text-xs text-ink-2">Basse mer vers</p>
                <p class="text-xl font-bold tabular-nums">{{ tide().lowTideHours.join(' et ') }}</p>
              </div>
            </div>
          }

          <p class="mt-3 text-sm">
            <span class="text-ink-2">Marnage :&nbsp;</span>
            <span class="font-semibold">{{ tide().amplitudeCm }}</span>
          </p>

          <ul class="mt-4 grid gap-2">
            @for (tip of tide().tips; track $index) {
              <li class="flex gap-2 text-sm leading-relaxed">
                <span class="text-accent" aria-hidden="true">•</span>
                <span>{{ tip }}</span>
              </li>
            }
          </ul>
        </section>

        @if (tide().regime === 'solaire') {
          <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
            <h2 class="font-semibold">Pourquoi l’horloge et pas la lune ?</h2>
            <p class="mt-1 text-sm leading-relaxed text-ink-2">
              La Société se trouve presque sur un point amphidromique de l’onde lunaire, le point
              autour duquel cette onde tourne et où son amplitude s’annule. La composante lunaire y
              est donc presque effacée, et c’est la composante solaire qui domine. Comme elle a une
              période de douze heures exactement, la marée revient aux mêmes heures tous les jours.
              C’est un cas très rare dans le monde.
            </p>
            <p class="mt-3 mb-1 text-sm font-medium">Amplitude des ondes à Papeete</p>
            <dl class="divide-y divide-surface-2">
              @for (harmonic of harmonics; track harmonic.wave) {
                <div class="flex items-baseline justify-between gap-3 py-2 text-sm">
                  <dt class="text-ink-2">{{ harmonic.wave }} ({{ harmonic.origin }})</dt>
                  <dd class="font-semibold tabular-nums">
                    {{ amplitude(harmonic.amplitudeCm) }} cm
                  </dd>
                </div>
              }
            </dl>
            <p class="mt-2 text-xs text-ink-2">
              L’onde solaire S2 dépasse l’onde lunaire M2 : c’est là toute la particularité.
            </p>
          </section>
        }

        <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
          <h2 class="font-semibold">Ce que ces repères ne disent pas</h2>
          <ul class="mt-2 grid gap-2">
            @for (limit of limits; track $index) {
              <li class="flex gap-2 text-sm leading-relaxed text-ink-2">
                <span class="text-coral" aria-hidden="true">•</span>
                <span>{{ limit }}</span>
              </li>
            }
          </ul>
        </section>
      </div>
    </main>
  `,
})
export class SeaComponent {
  protected readonly harmonics = PAPEETE_HARMONICS;

  /** Virgule decimale : « 7,2 cm », pas « 7.2 cm ». */
  protected amplitude(value: number): string {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1 }).format(value);
  }
  protected readonly limits = TIDE_LIMITS;

  protected readonly island = signal<Island>(readIsland());
  protected readonly dayOffset = signal(0);

  protected readonly grouped = computed(() =>
    ARCHIPELAGOS.map((archipelago) => ({
      id: archipelago.id,
      name: archipelago.name,
      islands: ISLANDS.filter((island) => island.archipelagoId === archipelago.id),
    })).filter((group) => group.islands.length > 0),
  );

  private readonly date = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + this.dayOffset());
    return d;
  });

  protected readonly dateLabel = computed(() =>
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(this.date()),
  );

  protected readonly sun = computed(() => {
    const d = this.date();
    const island = this.island();
    const times = sunTimes(
      { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() },
      island.lat,
      island.lon,
    );
    const at = (minutes: number | null) => formatSolarTime(minutes, island.utcOffsetHours);

    return {
      sunrise: at(times.sunrise),
      sunset: at(times.sunset),
      dawn: at(times.dawn),
      dusk: at(times.dusk),
      noon: at(times.solarNoon),
      dayLength: formatDuration(times.dayLength),
    };
  });

  protected readonly tide = computed(() => tideGuidanceFor(this.island().archipelagoId));

  protected label(island: Island): string {
    return island.place === undefined ? island.name : `${island.name} (${island.place})`;
  }

  protected onIsland(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const found = ISLANDS.find((island) => island.id === id);
    if (found) {
      this.island.set(found);
      writeStored(ISLAND_KEY, found.id);
    }
  }

  protected shiftDay(delta: number): void {
    this.dayOffset.update((current) =>
      Math.max(-MAX_DAY_OFFSET, Math.min(MAX_DAY_OFFSET, current + delta)),
    );
  }
}

function readIsland(): Island {
  const stored = readStored(ISLAND_KEY);
  return ISLANDS.find((island) => island.id === stored) ?? ISLANDS[0];
}
