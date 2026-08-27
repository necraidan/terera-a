import { Component, computed, signal } from '@angular/core';
import {
  XPF_PER_EUR,
  eurToXpf,
  formatEur,
  formatXpf,
  parseAmount,
  xpfToEur,
} from '../../shared/data/currency';
import { readStored, writeStored } from '../../shared/data/storage';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { QuickChipComponent } from '../../shared/ui/quick-chip.component';

type Direction = 'eur-to-xpf' | 'xpf-to-eur';

const DIRECTION_KEY = 'converter:direction';

const QUICK_EUR = [5, 10, 20, 50, 100];
const QUICK_XPF = [500, 1000, 2000, 5000, 10000];

@Component({
  selector: 'ta-converter',
  imports: [PageHeaderComponent, QuickChipComponent],
  template: `
    <ta-page-header width="wide" title="Franc pacifique ↔ Euro" />

    <main class="page-wide pb-28">
      <div class="lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4">
        <div class="rounded-card bg-surface-1 p-4">
          <label class="block text-sm font-medium text-ink-2" for="amount">
            {{ fromLabel() }}
          </label>
          <div class="mt-1 flex items-baseline gap-2">
            <input
              id="amount"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              enterkeyhint="done"
              placeholder="0"
              class="min-w-0 flex-1 bg-transparent text-4xl font-semibold tabular-nums outline-none"
              [value]="raw()"
              (input)="onInput($event)"
            />
            <span class="text-2xl font-semibold text-ink-2">{{ fromUnit() }}</span>
          </div>
        </div>

        <div class="flex justify-center py-2 lg:py-0">
          <button
            type="button"
            class="grid size-12 place-items-center rounded-full bg-accent text-accent-ink active:scale-95"
            aria-label="Inverser le sens de conversion"
            (click)="swap()"
          >
            <svg viewBox="0 0 24 24" class="size-6 lg:rotate-90" fill="none" aria-hidden="true">
              <path
                d="M7 4v13m0 0l-3-3m3 3l3-3M17 20V7m0 0l3 3m-3-3l-3 3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <div class="rounded-card bg-accent p-4 text-accent-ink">
          <p class="text-sm font-medium opacity-80">{{ toLabel() }}</p>
          <output class="mt-1 block text-4xl font-bold tabular-nums">{{ result() }}</output>
        </div>
      </div>

      <p class="mt-6 mb-2 text-sm font-medium text-ink-2">Montants rapides</p>
      <div class="flex flex-wrap gap-2">
        @for (amount of quickAmounts(); track amount) {
          <ta-quick-chip [label]="quickLabel(amount)" (picked)="pick(amount)" />
        }
      </div>

      <p class="mt-8 text-sm text-ink-2">
        Taux fixe légal : 1 € = {{ rateLabel }} F. Le franc pacifique est arrimé à l’euro, ce taux
        ne varie pas, aucune connexion n’est nécessaire.
      </p>
    </main>
  `,
})
export class ConverterComponent {
  protected readonly raw = signal('');

  /** Restauré d'une session à l'autre : on convertit toujours dans le même sens. */
  protected readonly direction = signal<Direction>(readDirection());

  protected readonly rateLabel = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 6,
  }).format(XPF_PER_EUR);

  protected readonly fromLabel = computed(() =>
    this.direction() === 'eur-to-xpf' ? 'Montant en euros' : 'Montant en francs pacifique',
  );

  protected readonly toLabel = computed(() =>
    this.direction() === 'eur-to-xpf' ? 'Soit en francs pacifique' : 'Soit en euros',
  );

  protected readonly fromUnit = computed(() => (this.direction() === 'eur-to-xpf' ? '€' : 'F'));

  protected readonly quickAmounts = computed(() =>
    this.direction() === 'eur-to-xpf' ? QUICK_EUR : QUICK_XPF,
  );

  protected readonly result = computed(() => {
    const amount = parseAmount(this.raw());
    const toXpf = this.direction() === 'eur-to-xpf';

    if (amount === null) {
      return toXpf ? formatXpf(0) : formatEur(0);
    }
    return toXpf ? formatXpf(eurToXpf(amount)) : formatEur(xpfToEur(amount));
  });

  protected onInput(event: Event): void {
    this.raw.set((event.target as HTMLInputElement).value);
  }

  /** Reprend le résultat comme nouvelle saisie, pour enchaîner les calculs. */
  protected swap(): void {
    const amount = parseAmount(this.raw());
    const wasEurToXpf = this.direction() === 'eur-to-xpf';

    const next: Direction = wasEurToXpf ? 'xpf-to-eur' : 'eur-to-xpf';
    this.direction.set(next);
    writeStored(DIRECTION_KEY, next);

    if (amount === null) {
      return;
    }
    const converted = wasEurToXpf ? eurToXpf(amount) : xpfToEur(amount);
    this.raw.set(String(converted).replace('.', ','));
  }

  protected pick(amount: number): void {
    this.raw.set(String(amount));
  }

  protected quickLabel(amount: number): string {
    return this.direction() === 'eur-to-xpf' ? `${amount} €` : formatXpf(amount);
  }
}

/**
 * Sens mémorisé, XPF vers EUR par défaut : sur place on lit des prix en francs et
 * on veut savoir ce qu'ils valent, pas l'inverse.
 */
function readDirection(): Direction {
  return readStored(DIRECTION_KEY) === 'eur-to-xpf' ? 'eur-to-xpf' : 'xpf-to-eur';
}
