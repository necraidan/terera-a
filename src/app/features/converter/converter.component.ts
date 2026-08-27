import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  XPF_PER_EUR,
  eurToXpf,
  formatEur,
  formatXpf,
  parseAmount,
  xpfToEur,
} from '../../shared/data/currency';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { QuickChipComponent } from '../../shared/ui/quick-chip.component';

type Direction = 'eur-to-xpf' | 'xpf-to-eur';

/** Montants courants sur place : un plat, une course, une excursion, une nuit. */
const QUICK_EUR = [5, 10, 20, 50, 100];
const QUICK_XPF = [500, 1000, 2000, 5000, 10000];

@Component({
  selector: 'ta-converter',
  imports: [PageHeaderComponent, QuickChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ta-page-header title="Euro ↔ Franc pacifique" />

    <main class="mx-auto max-w-md px-4 pb-28">
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

      <div class="flex justify-center py-2">
        <button
          type="button"
          class="grid size-12 place-items-center rounded-full bg-accent text-accent-ink active:scale-95"
          aria-label="Inverser le sens de conversion"
          (click)="swap()"
        >
          <svg viewBox="0 0 24 24" class="size-6" fill="none" aria-hidden="true">
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

      <p class="mt-6 mb-2 text-sm font-medium text-ink-2">Montants rapides</p>
      <div class="flex flex-wrap gap-2">
        @for (amount of quickAmounts(); track amount) {
          <ta-quick-chip [label]="quickLabel(amount)" (picked)="pick(amount)" />
        }
      </div>

      <p class="mt-8 text-sm text-ink-2">
        Taux fixe légal : 1 € = {{ rateLabel }} F. Le franc pacifique est arrimé à l’euro, ce taux
        ne varie pas — aucune connexion n’est nécessaire.
      </p>
    </main>
  `,
})
export class ConverterComponent {
  protected readonly raw = signal('');
  protected readonly direction = signal<Direction>('eur-to-xpf');

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

  /**
   * Inverse le sens et reprend le résultat comme nouvelle saisie : l'utilisateur
   * qui vient de convertir 50 € voit 5 967 F puis peut repartir de ce montant.
   */
  protected swap(): void {
    const amount = parseAmount(this.raw());
    const wasEurToXpf = this.direction() === 'eur-to-xpf';

    this.direction.set(wasEurToXpf ? 'xpf-to-eur' : 'eur-to-xpf');

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
