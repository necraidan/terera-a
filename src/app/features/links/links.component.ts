import { Component, computed, inject, signal } from '@angular/core';
import { LinkFavoritesStore } from '../../shared/data/favorites.store';
import { LINK_CATEGORIES } from '../../shared/data/links.data';
import { LINKS_OFFLINE_WARNING, UsefulLink } from '../../shared/data/links.models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { QuickChipComponent } from '../../shared/ui/quick-chip.component';

interface Section {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly links: readonly UsefulLink[];
}

@Component({
  selector: 'ta-links',
  imports: [PageHeaderComponent, QuickChipComponent],
  template: `
    <ta-page-header width="wide" title="Liens utiles" />

    <main class="page-wide">
      <p class="rounded-card bg-surface-2 p-3 text-sm leading-relaxed">
        <span class="font-semibold">📡 Connexion requise.</span>
        {{ warning }}
      </p>

      <div class="mt-4 flex gap-2">
        <ta-quick-chip
          label="Tout"
          [selected]="!essentialOnly()"
          (picked)="essentialOnly.set(false)"
        />
        <ta-quick-chip
          label="★ L’essentiel"
          [selected]="essentialOnly()"
          (picked)="essentialOnly.set(true)"
        />
      </div>

      <div class="mt-2 grid items-start gap-x-6 md:grid-cols-2">
        @for (section of sections(); track section.id) {
          <section class="mt-6">
            <h2 class="mb-2 font-semibold">{{ section.icon }} {{ section.title }}</h2>
            <ul class="overflow-hidden rounded-card bg-surface-1">
              @for (link of section.links; track link.url) {
                <li class="flex items-start border-b border-surface-2 last:border-b-0">
                  <a
                    [href]="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex min-w-0 flex-1 items-start gap-3 p-3 active:bg-surface-2"
                  >
                    <span class="min-w-0 flex-1">
                      <span class="flex items-baseline gap-2">
                        <span class="font-medium">{{ link.title }}</span>
                        @if (link.essential) {
                          <span class="text-xs text-accent" aria-label="Essentiel">●</span>
                        }
                      </span>
                      <span class="mt-0.5 block text-sm text-ink-2">{{ link.purpose }}</span>
                      <span class="mt-1 block truncate text-xs text-ink-2 opacity-70">
                        {{ host(link.url) }}
                      </span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      class="mt-1 size-4 shrink-0 text-ink-2"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 17L17 7M17 7H9m8 0v8"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </a>
                  <button
                    type="button"
                    class="grid size-11 shrink-0 place-items-center self-center rounded-full text-2xl"
                    [class]="favorites.has(link.url) ? 'text-coral' : 'text-ink-2 opacity-40'"
                    [attr.aria-label]="
                      (favorites.has(link.url)
                        ? 'Retirer des favoris : '
                        : 'Ajouter aux favoris : ') + link.title
                    "
                    [attr.aria-pressed]="favorites.has(link.url)"
                    (click)="favorites.toggle(link.url)"
                  >
                    {{ favorites.has(link.url) ? '★' : '☆' }}
                  </button>
                </li>
              }
            </ul>
          </section>
        }
      </div>
    </main>
  `,
})
export class LinksComponent {
  protected readonly favorites = inject(LinkFavoritesStore);
  protected readonly warning = LINKS_OFFLINE_WARNING;
  protected readonly essentialOnly = signal(false);

  /**
   * Les liens épinglés forment une première section et quittent leur catégorie
   * d'origine : sur un écran de téléphone, les voir deux fois coûterait plus de
   * défilement que ça n'aiderait.
   */
  protected readonly sections = computed<readonly Section[]>(() => {
    const keep = (link: UsefulLink) => !this.essentialOnly() || link.essential;

    const pinned = LINK_CATEGORIES.flatMap((category) =>
      category.links.filter((link) => keep(link) && this.favorites.has(link.url)),
    );

    const rest = LINK_CATEGORIES.map((category) => ({
      id: category.id,
      title: category.title,
      icon: category.icon,
      links: category.links.filter((link) => keep(link) && !this.favorites.has(link.url)),
    })).filter((section) => section.links.length > 0);

    return pinned.length === 0
      ? rest
      : [{ id: 'favoris', title: 'Mes favoris', icon: '★', links: pinned }, ...rest];
  });

  /** Nom d'hôte seul, pour montrer où mène le lien avant de le suivre. */
  protected host(url: string): string {
    try {
      return new URL(url).host.replace(/^www\./, '');
    } catch {
      return url;
    }
  }
}
