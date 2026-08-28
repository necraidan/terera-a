import { Component, signal } from '@angular/core';
import { formatEur, formatXpf, xpfToEur } from '../../shared/data/currency';
import {
  BANKNOTES,
  CASH_BENCHMARKS,
  CASH_NOTES,
  CASH_TRAPS,
  COINS,
  MONEY_IMAGE_CREDITS,
} from '../../shared/data/money.data';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { QuickChipComponent } from '../../shared/ui/quick-chip.component';

type Tab = 'billets' | 'pieces';

/**
 * Échelle des aperçus, en pixels par millimètre. Le problème pratique n'est pas
 * de connaître la valeur d'une coupure, c'est de reconnaître laquelle on tient :
 * une échelle commune à toute une famille rend les écarts de taille lisibles.
 */
const NOTE_SCALE = 1.85;
const COIN_SCALE = 2.4;

@Component({
  selector: 'ta-money',
  imports: [PageHeaderComponent, QuickChipComponent],
  template: `
    <ta-page-header width="wide" title="Billets et pièces" />

    <main class="page-wide">
      <div class="flex gap-2">
        <ta-quick-chip
          label="Billets"
          [selected]="tab() === 'billets'"
          (picked)="tab.set('billets')"
        />
        <ta-quick-chip
          label="Pièces"
          [selected]="tab() === 'pieces'"
          (picked)="tab.set('pieces')"
        />
      </div>

      @if (tab() === 'billets') {
        <section class="mt-4 rounded-card bg-surface-1 p-4">
          <h2 class="font-semibold">Tailles comparées</h2>
          <p class="mt-1 text-sm text-ink-2">
            À l’échelle réelle. La hauteur sépare les basses des hautes coupures, la longueur croît
            de 6 mm à chaque valeur pour la reconnaissance au toucher.
          </p>
          <div class="mt-4 flex flex-col items-start gap-2 lg:flex-row lg:items-end">
            @for (note of banknotes; track note.id) {
              <img
                [src]="note.imageRecto"
                [alt]="'Billet de ' + note.value + ' francs pacifique'"
                class="rounded-sm shadow-sm"
                [style.width.px]="note.widthMm * noteScale"
                [style.height.px]="note.heightMm * noteScale"
                loading="lazy"
                decoding="async"
              />
            }
          </div>
        </section>

        <div class="grid gap-3 lg:grid-cols-2">
          @for (note of banknotes; track note.id) {
            <section class="flex flex-col overflow-hidden rounded-card bg-surface-1">
              <div
                class="flex items-baseline justify-between gap-2 p-4 text-white"
                [style.background]="
                  'linear-gradient(135deg, ' + note.colorHex + ', ' + note.accentHex + ')'
                "
              >
                <span class="text-3xl font-bold">{{ formatValue(note.value) }}</span>
                <span class="text-sm font-medium opacity-90">{{ euro(note.value) }}</span>
              </div>

              <div class="grid grid-cols-2 gap-2 p-3">
                <figure>
                  <img
                    [src]="note.imageRecto"
                    [alt]="'Recto du billet de ' + note.value + ' francs'"
                    class="w-full rounded-sm shadow-sm"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption class="mt-1 text-xs text-ink-2">Recto</figcaption>
                </figure>
                <figure>
                  <img
                    [src]="note.imageVerso"
                    [alt]="'Verso du billet de ' + note.value + ' francs'"
                    class="w-full rounded-sm shadow-sm"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption class="mt-1 text-xs text-ink-2">Verso</figcaption>
                </figure>
              </div>

              <dl class="divide-y divide-surface-2 border-t border-surface-2">
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Couleur</dt>
                  <dd class="flex-1 text-sm">{{ note.colorName }}</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Format</dt>
                  <dd class="flex-1 text-sm">{{ note.widthMm }} × {{ note.heightMm }} mm</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Recto</dt>
                  <dd class="flex-1 text-sm">{{ note.recto }}</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Verso</dt>
                  <dd class="flex-1 text-sm">{{ note.verso }}</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Sécurité</dt>
                  <dd class="flex-1 text-sm">{{ note.security }}</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Ça paie</dt>
                  <dd class="flex-1 text-sm">{{ note.buys }}</dd>
                </div>
              </dl>
              <p class="bg-surface-2 p-3 text-sm">
                <span class="font-semibold">Repère :</span>
                {{ note.recognition }}
              </p>
            </section>
          }
        </div>
      } @else {
        <section class="mt-4 rounded-card bg-surface-1 p-4">
          <h2 class="font-semibold">Tailles comparées</h2>
          <p class="mt-1 text-sm text-ink-2">
            À l’échelle réelle. Le diamètre ne croît qu’à l’intérieur de chaque couleur : les
            argentées d’abord, les dorées ensuite.
          </p>
          <div class="-mx-4 mt-4 flex items-end gap-2 overflow-x-auto px-4 pb-1">
            @for (coin of coins; track coin.id) {
              <img
                [src]="coin.imageMotif"
                [alt]="'Pièce de ' + coin.value + ' francs pacifique'"
                class="shrink-0 rounded-full bg-white shadow-sm"
                [style.width.px]="coin.diameterMm * coinScale"
                [style.height.px]="coin.diameterMm * coinScale"
                loading="lazy"
                decoding="async"
              />
            }
          </div>
        </section>

        <div class="grid gap-3 lg:grid-cols-2">
          @for (coin of coins; track coin.id) {
            <section class="flex flex-col overflow-hidden rounded-card bg-surface-1">
              <div class="flex items-center gap-4 p-4">
                <img
                  [src]="coin.imageMotif"
                  [alt]="'Pièce de ' + coin.value + ' francs pacifique'"
                  class="shrink-0 rounded-full bg-white shadow-sm"
                  [style.width.px]="coin.diameterMm * coinScale"
                  [style.height.px]="coin.diameterMm * coinScale"
                  loading="lazy"
                  decoding="async"
                />
                <div class="min-w-0">
                  <p class="text-2xl font-bold">{{ formatValue(coin.value) }}</p>
                  <p class="text-sm text-ink-2">{{ euro(coin.value) }} · {{ coin.theme }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 px-4 pb-3">
                <figure class="text-center">
                  <img
                    [src]="coin.imageMotif"
                    [alt]="'Face au motif de la pièce de ' + coin.value + ' francs'"
                    class="mx-auto w-full max-w-28 rounded-full bg-white shadow-sm"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption class="mt-1 text-xs text-ink-2">Face au motif</figcaption>
                </figure>
                <figure class="text-center">
                  <img
                    [src]="coin.imageValeur"
                    [alt]="'Face à la valeur de la pièce de ' + coin.value + ' francs'"
                    class="mx-auto w-full max-w-28 rounded-full bg-white shadow-sm"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption class="mt-1 text-xs text-ink-2">Face à la valeur</figcaption>
                </figure>
              </div>

              <dl class="divide-y divide-surface-2 border-t border-surface-2">
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Aspect</dt>
                  <dd class="flex-1 text-sm">{{ coin.toneName }}</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Diamètre</dt>
                  <dd class="flex-1 text-sm">{{ coin.diameterMm }} mm</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Forme</dt>
                  <dd class="flex-1 text-sm">{{ coin.shape }}</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Alliage</dt>
                  <dd class="flex-1 text-sm">{{ coin.alloy }}</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Motif</dt>
                  <dd class="flex-1 text-sm">{{ coin.motifSide }}</dd>
                </div>
                <div class="flex gap-3 p-3">
                  <dt class="w-28 shrink-0 text-sm text-ink-2">Ça paie</dt>
                  <dd class="flex-1 text-sm">{{ coin.buys }}</dd>
                </div>
              </dl>
              <p class="bg-surface-2 p-3 text-sm">
                <span class="font-semibold">Repère :</span>
                {{ coin.recognition }}
              </p>
            </section>
          }
        </div>
      }

      <section class="mt-8 rounded-card bg-surface-1 p-4">
        <h2 class="font-semibold">⚠️ Les pièges</h2>
        <ul class="mt-2 grid gap-2">
          @for (trap of traps; track $index) {
            <li class="flex gap-2 text-sm leading-relaxed">
              <span class="text-coral" aria-hidden="true">•</span>
              <span>{{ trap }}</span>
            </li>
          }
        </ul>
      </section>

      <section class="mt-4 rounded-card bg-surface-1 p-4">
        <h2 class="font-semibold">Repères de prix</h2>
        <dl class="mt-2 divide-y divide-surface-2">
          @for (item of benchmarks; track item.label) {
            <div class="flex items-baseline justify-between gap-3 py-2">
              <dt class="text-sm text-ink-2">{{ item.label }}</dt>
              <dd class="text-right text-sm font-semibold">{{ item.value }}</dd>
            </div>
          }
        </dl>
      </section>

      <section class="mt-4 rounded-card bg-surface-1 p-4">
        <h2 class="font-semibold">Bon à savoir</h2>
        <ul class="mt-2 grid gap-2">
          @for (note of notes; track $index) {
            <li class="flex gap-2 text-sm leading-relaxed">
              <span class="text-accent" aria-hidden="true">•</span>
              <span>{{ note }}</span>
            </li>
          }
        </ul>
      </section>

      <p class="mt-2 text-xs text-ink-2">
        Photos de Wikimedia Commons.
        @for (credit of credits; track credit.author) {
          {{ credit.author }} ({{ credit.licence }}){{ $last ? '.' : ', ' }}
        }
      </p>
    </main>
  `,
})
export class MoneyComponent {
  protected readonly tab = signal<Tab>('billets');

  protected readonly banknotes = BANKNOTES;
  protected readonly coins = COINS;
  protected readonly traps = CASH_TRAPS;
  protected readonly benchmarks = CASH_BENCHMARKS;
  protected readonly notes = CASH_NOTES;
  protected readonly credits = MONEY_IMAGE_CREDITS;

  protected readonly noteScale = NOTE_SCALE;
  protected readonly coinScale = COIN_SCALE;

  protected formatValue(value: number): string {
    return formatXpf(value);
  }

  protected euro(value: number): string {
    return formatEur(xpfToEur(value));
  }
}
