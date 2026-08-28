import { Component, computed, signal } from '@angular/core';
import { parseDecimalInput } from '../../shared/data/number-input';
import { readStored, writeStored } from '../../shared/data/storage';
import {
  UNIT_CATEGORIES,
  Unit,
  convertUnit,
  findCategory,
  findUnit,
  formatUnitValue,
} from '../../shared/data/units';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { QuickChipComponent } from '../../shared/ui/quick-chip.component';

const CATEGORY_KEY = 'units:category';

const sourceKey = (categoryId: string) => `units:source:${categoryId}`;

interface Conversion {
  readonly unit: Unit;
  readonly text: string;
  /** Nom de l'unité suivi de son symbole, sauf quand les deux se confondent. */
  readonly name: string;
}

@Component({
  selector: 'ta-units',
  imports: [PageHeaderComponent, QuickChipComponent],
  template: `
    <ta-page-header width="wide" title="Convertisseur d’unités" />

    <main class="page-wide">
      <div class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        @for (item of categories; track item.id) {
          <ta-quick-chip
            [label]="item.icon + ' ' + item.title"
            [selected]="category().id === item.id"
            (picked)="selectCategory(item.id)"
          />
        }
      </div>

      <div class="mt-4 rounded-card bg-surface-1 p-4">
        <label class="block text-sm font-medium text-ink-2" for="unit-amount">Valeur</label>
        <div class="mt-1 flex items-baseline gap-2">
          <input
            id="unit-amount"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            enterkeyhint="done"
            placeholder="0"
            class="min-w-0 flex-1 bg-transparent text-4xl font-semibold tabular-nums outline-none"
            [value]="raw()"
            (input)="onInput($event)"
          />
          <span class="text-2xl font-semibold text-ink-2">{{ source().symbol }}</span>
        </div>

        <p class="mt-4 mb-2 text-sm font-medium text-ink-2">Unité de départ</p>
        <div class="flex flex-wrap gap-2">
          @for (item of category().units; track item.id) {
            <ta-quick-chip
              [label]="item.symbol"
              [selected]="source().id === item.id"
              (picked)="selectSource(item.id)"
            />
          }
        </div>
      </div>

      @if (conversions().length) {
        <ul class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          @for (conversion of conversions(); track conversion.unit.id) {
            <li class="min-w-0 rounded-card bg-surface-1 p-4">
              <div class="flex items-baseline justify-between gap-3">
                <span class="text-sm text-ink-2">{{ conversion.name }}</span>
                <span class="text-2xl font-bold tabular-nums">
                  {{ conversion.text }}
                  <span class="text-base font-medium text-ink-2">{{ conversion.unit.symbol }}</span>
                </span>
              </div>
              @if (conversion.unit.note) {
                <p class="mt-1 text-xs text-ink-2">{{ conversion.unit.note }}</p>
              }
            </li>
          }
        </ul>
      }

      <p class="mt-6 text-sm text-ink-2">{{ category().hint }}</p>
    </main>
  `,
})
export class UnitsComponent {
  protected readonly categories = UNIT_CATEGORIES;

  protected readonly category = signal(readCategory());
  protected readonly source = signal<Unit>(findUnit(readCategory(), readSource(readCategory())));
  protected readonly raw = signal('');

  /** Toutes les autres unités d'un coup : évite un second sélecteur sur mobile. */
  protected readonly conversions = computed<readonly Conversion[]>(() => {
    // Seule la température a un sens en dessous de zéro.
    const value = parseDecimalInput(this.raw(), {
      allowNegative: this.category().id === 'temperature',
    });
    if (value === null) {
      return [];
    }

    const from = this.source();
    return this.category()
      .units.filter((unit) => unit.id !== from.id)
      .map((unit) => ({
        unit,
        text: formatUnitValue(convertUnit(value, from, unit), unit),
        name: unitName(unit),
      }));
  });

  protected onInput(event: Event): void {
    this.raw.set((event.target as HTMLInputElement).value);
  }

  protected selectCategory(id: string): void {
    const next = findCategory(id);
    if (!next) {
      return;
    }
    this.category.set(next);
    this.source.set(findUnit(next, readSource(next)));
    writeStored(CATEGORY_KEY, next.id);
  }

  protected selectSource(id: string): void {
    const unit = findUnit(this.category(), id);
    this.source.set(unit);
    writeStored(sourceKey(this.category().id), unit.id);
  }
}

/**
 * Rappelle le symbole de l'unité derrière son nom : « milles nautiques (NM) »
 * fait le lien avec le sigle qui figure sur les chips et sur le résultat.
 *
 * Les unités dont le symbole est déjà le nom, comme les brasses, n'y gagnent
 * rien et gardent leur libellé seul.
 */
function unitName(unit: Unit): string {
  return unit.symbol === unit.label ? unit.label : `${unit.label} (${unit.symbol})`;
}

function readCategory() {
  const stored = readStored(CATEGORY_KEY);
  return (stored !== null ? findCategory(stored) : undefined) ?? UNIT_CATEGORIES[0];
}

function readSource(category: { readonly id: string; readonly defaultUnitId: string }): string {
  return readStored(sourceKey(category.id)) ?? category.defaultUnitId;
}
