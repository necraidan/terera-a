import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesStore } from '../../shared/data/favorites.store';
import { LEXICON } from '../../shared/data/lexicon.data';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  LexiconCategory,
  LexiconEntry,
} from '../../shared/data/lexicon.models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { QuickChipComponent } from '../../shared/ui/quick-chip.component';

/** `null` = tout le lexique, `'favoris'` = la sélection de l'utilisateur. */
type Filter = LexiconCategory | 'favoris' | null;

interface Section {
  readonly key: string;
  readonly label: string;
  readonly entries: readonly LexiconEntry[];
}

/**
 * Retire accents et macrons pour la recherche : taper « mauruuru » doit trouver
 * « Māuruuru »et « a table » doit trouver « À table ».
 */
function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/['’]/g, '')
    .toLowerCase();
}

@Component({
  selector: 'ta-lexicon',
  imports: [RouterLink, PageHeaderComponent, QuickChipComponent],
  template: `
    <ta-page-header width="wide" title="Lexique tahitien" />

    <main class="page-wide pb-28">
      <input
        type="search"
        placeholder="Chercher un mot…"
        autocomplete="off"
        aria-label="Chercher un mot"
        class="w-full rounded-full bg-surface-1 px-4 py-3 outline-none"
        [value]="search()"
        (input)="onSearch($event)"
      />

      <div class="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <ta-quick-chip label="Tout" [selected]="filter() === null" (picked)="filter.set(null)" />
        <ta-quick-chip
          [label]="'★ Favoris' + (favorites.count() ? ' (' + favorites.count() + ')' : '')"
          [selected]="filter() === 'favoris'"
          (picked)="filter.set('favoris')"
        />
        @for (category of categories; track category) {
          <ta-quick-chip
            [label]="categoryLabels[category]"
            [selected]="filter() === category"
            (picked)="filter.set(category)"
          />
        }
      </div>

      @if (sections().length === 0) {
        <p class="mt-8 text-center text-ink-2">
          @if (filter() === 'favoris') {
            Aucun favori pour l’instant : touchez l’étoile d’un mot pour le garder ici.
          } @else {
            Aucun mot ne correspond à cette recherche.
          }
        </p>
      }

      <div>
        @for (section of sections(); track section.key) {
          <section class="mt-6">
            <h2 class="mb-2 text-sm font-semibold tracking-wide text-ink-2 uppercase">
              {{ section.label }}
            </h2>
            <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              @for (entry of section.entries; track entry.id) {
                <li class="flex items-center gap-3 rounded-card bg-surface-1 p-3">
                  <div class="min-w-0 flex-1">
                    <p class="text-lg font-semibold">{{ entry.ty }}</p>
                    <p class="text-ink-1">{{ entry.fr }}</p>
                    <p class="text-sm text-ink-2 italic">{{ entry.pron }}</p>
                    @if (entry.note) {
                      <p class="mt-1 text-xs leading-relaxed text-coral">{{ entry.note }}</p>
                    }
                  </div>
                  <button
                    type="button"
                    class="grid size-11 shrink-0 place-items-center rounded-full text-2xl"
                    [class]="favorites.has(entry.id) ? 'text-coral' : 'text-ink-2 opacity-40'"
                    [attr.aria-label]="
                      (favorites.has(entry.id)
                        ? 'Retirer des favoris : '
                        : 'Ajouter aux favoris : ') + entry.ty
                    "
                    [attr.aria-pressed]="favorites.has(entry.id)"
                    (click)="favorites.toggle(entry.id)"
                  >
                    {{ favorites.has(entry.id) ? '★' : '☆' }}
                  </button>
                </li>
              }
            </ul>
          </section>
        }
      </div>

      <a
        routerLink="/lexique/prononciation"
        class="mt-8 flex items-center gap-3 rounded-card bg-surface-1 p-4 active:bg-surface-2"
      >
        <span class="text-xl" aria-hidden="true">🔊</span>
        <span class="min-w-0 flex-1 text-sm">
          <span class="block font-semibold">Prononcer le tahitien</span>
          <span class="block text-ink-2">
            L’eta, les macrons, les voyelles qui se détachent : dix règles pour ne plus buter sur
            Faa’a ou Teahupo’o.
          </span>
        </span>
        <span class="text-ink-2" aria-hidden="true">›</span>
      </a>
    </main>
  `,
})
export class LexiconComponent {
  protected readonly favorites = inject(FavoritesStore);

  protected readonly categories = CATEGORY_ORDER;
  protected readonly categoryLabels = CATEGORY_LABELS;

  protected readonly search = signal('');
  protected readonly filter = signal<Filter>(null);

  private readonly matching = computed(() => {
    const needle = fold(this.search().trim());
    const activeFilter = this.filter();

    return LEXICON.filter((entry) => {
      if (activeFilter === 'favoris' && !this.favorites.has(entry.id)) {
        return false;
      }
      if (activeFilter !== null && activeFilter !== 'favoris' && entry.category !== activeFilter) {
        return false;
      }
      if (needle === '') {
        return true;
      }
      return (
        fold(entry.fr).includes(needle) ||
        fold(entry.ty).includes(needle) ||
        fold(entry.pron).includes(needle)
      );
    });
  });

  protected readonly sections = computed<readonly Section[]>(() => {
    const entries = this.matching();

    // En vue « Favoris » l'utilisateur cherche sa propre liste : la découper par
    // catégorie la rendrait plus longue à parcourir qu'utile.
    if (this.filter() === 'favoris') {
      return entries.length === 0 ? [] : [{ key: 'favoris', label: 'Vos favoris', entries }];
    }

    return CATEGORY_ORDER.map((category) => ({
      key: category,
      label: CATEGORY_LABELS[category],
      entries: entries.filter((entry) => entry.category === category),
    })).filter((section) => section.entries.length > 0);
  });

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }
}
