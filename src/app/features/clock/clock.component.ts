import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import {
  FRANCE_TZ,
  TAHITI_TZ,
  hoursAheadOfTahiti,
  politeCallWindowInTahiti,
  shiftWallTime,
} from '../../shared/data/timezones';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

type Origin = 'tahiti' | 'france';

const timeFormat = (timeZone: string) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone, hour: '2-digit', minute: '2-digit' });

const dateFormat = (timeZone: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

@Component({
  selector: 'ta-clock',
  imports: [PageHeaderComponent],
  template: `
    <ta-page-header width="wide" title="Heure à Tahiti" />

    <main class="page-wide">
      <div class="grid gap-3 sm:grid-cols-2">
        <section class="rounded-card bg-accent p-4 text-accent-ink">
          <p class="text-sm font-medium opacity-80">🌴 Tahiti (Papeete)</p>
          <p class="text-5xl font-bold tabular-nums lg:text-7xl">{{ tahitiTime() }}</p>
          <p class="mt-1 text-sm capitalize opacity-80">{{ tahitiDate() }}</p>
        </section>

        <section class="rounded-card bg-surface-1 p-4">
          <p class="text-sm font-medium text-ink-2">🇫🇷 France (Paris)</p>
          <p class="text-5xl font-bold tabular-nums lg:text-7xl">{{ franceTime() }}</p>
          <p class="mt-1 text-sm text-ink-2 capitalize">{{ franceDate() }}</p>
        </section>
      </div>

      <p class="mt-3 rounded-card bg-surface-2 px-4 py-3 text-sm">
        La France a <strong>{{ offsetHours() }} heures d’avance</strong> sur Tahiti.
      </p>

      <div class="mt-6 grid items-start gap-4 lg:grid-cols-2">
        <section class="rounded-card bg-surface-1 p-4">
          <h2 class="font-semibold">Convertir une heure</h2>

          <div class="mt-3 flex gap-2">
            <button
              type="button"
              class="min-h-11 flex-1 rounded-full text-sm font-medium"
              [class]="origin() === 'tahiti' ? 'bg-accent text-accent-ink' : 'bg-surface-2'"
              (click)="origin.set('tahiti')"
            >
              Tahiti → France
            </button>
            <button
              type="button"
              class="min-h-11 flex-1 rounded-full text-sm font-medium"
              [class]="origin() === 'france' ? 'bg-accent text-accent-ink' : 'bg-surface-2'"
              (click)="origin.set('france')"
            >
              France → Tahiti
            </button>
          </div>

          <label class="mt-4 block text-sm font-medium text-ink-2" for="wall-time">
            Il est {{ origin() === 'tahiti' ? 'à Tahiti' : 'en France' }}
          </label>
          <input
            id="wall-time"
            type="time"
            class="mt-1 w-full rounded-lg bg-surface-2 px-3 py-3 text-2xl tabular-nums outline-none"
            [value]="inputTime()"
            (input)="onTimeInput($event)"
          />

          <p class="mt-4 text-sm font-medium text-ink-2">
            Soit {{ origin() === 'tahiti' ? 'en France' : 'à Tahiti' }}
          </p>
          <p class="text-3xl font-bold tabular-nums">
            {{ convertedTime() }}
            @if (convertedDayLabel()) {
              <span class="text-base font-medium text-coral">{{ convertedDayLabel() }}</span>
            }
          </p>
        </section>

        <section class="rounded-card bg-surface-1 p-4">
          <h2 class="font-semibold">📞 Quand appeler la famille ?</h2>
          @if (callWindow(); as window) {
            <p class="mt-1 text-ink-2">
              Entre <strong class="text-ink-1">{{ window.startHour }} h</strong> et
              <strong class="text-ink-1">{{ window.endHour }} h</strong>, heure de Tahiti : il sera
              alors une heure raisonnable en France.
            </p>
          } @else {
            <p class="mt-1 text-ink-2">
              Aucun créneau ne convient aux deux côtés : il faudra que quelqu’un veille.
            </p>
          }
        </section>
      </div>
    </main>
  `,
})
export class ClockComponent {
  private readonly destroyRef = inject(DestroyRef);

  /** Instant courant, rafraîchi chaque seconde. */
  private readonly now = signal(new Date());

  protected readonly origin = signal<Origin>('tahiti');
  protected readonly inputTime = signal(currentTimeIn(TAHITI_TZ, new Date()));

  protected readonly tahitiTime = computed(() => timeFormat(TAHITI_TZ).format(this.now()));
  protected readonly franceTime = computed(() => timeFormat(FRANCE_TZ).format(this.now()));
  protected readonly tahitiDate = computed(() => dateFormat(TAHITI_TZ).format(this.now()));
  protected readonly franceDate = computed(() => dateFormat(FRANCE_TZ).format(this.now()));

  protected readonly offsetHours = computed(() => hoursAheadOfTahiti(this.now()));

  protected readonly callWindow = computed(() => politeCallWindowInTahiti(this.offsetHours()));

  private readonly converted = computed(() => {
    const minutes = parseTimeInput(this.inputTime());
    if (minutes === null) {
      return null;
    }
    // Vers la France on ajoute le décalage, vers Tahiti on le retire.
    const shift = this.origin() === 'tahiti' ? this.offsetHours() : -this.offsetHours();
    return shiftWallTime(minutes, shift);
  });

  protected readonly convertedTime = computed(() => {
    const wall = this.converted();
    if (wall === null) {
      return '--:--';
    }
    return `${pad(wall.hours)}:${pad(wall.minutes)}`;
  });

  protected readonly convertedDayLabel = computed(() => {
    switch (this.converted()?.dayShift) {
      case 1:
        return ' le lendemain';
      case -1:
        return ' la veille';
      default:
        return '';
    }
  });

  constructor() {
    // En zoneless, écrire dans un signal suffit à replanifier le rendu : pas
    // besoin de sortir du contexte Angular ni de marquer la vue sale.
    const timer = setInterval(() => this.now.set(new Date()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  protected onTimeInput(event: Event): void {
    this.inputTime.set((event.target as HTMLInputElement).value);
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Heure courante d'un fuseau au format `HH:MM`, pour préremplir l'input. */
function currentTimeIn(timeZone: string, instant: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant);
}

/** `HH:MM` → minutes depuis minuit, ou `null` si l'input est vide/invalide. */
function parseTimeInput(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}
