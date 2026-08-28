import { Location } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

/**
 * En-tête d'un écran : flèche de retour et titre.
 *
 * `sticky` avec un padding haut en safe-area, pour rester sous l'encoche en
 * standalone iPhone. La largeur suit celle de la page, sans quoi la flèche se
 * retrouverait seule au bord de l'écran sur desktop.
 *
 * La flèche revient en arrière dans l'historique quand l'entrée précédente
 * est dans l'app : le routeur restaure alors la position de scroll de la liste.
 * Un `routerLink` vers `backTo` ferait une navigation avant, remise en haut.
 * `backTo` reste le repli (arrivée par URL directe ou icône d'accueil).
 */
@Component({
  selector: 'ta-page-header',
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 10;
      padding-top: env(safe-area-inset-top);
      background-color: var(--color-surface-0);
    }
  `,
  template: `
    <div [class]="containerClass()">
      <a
        [href]="backTo()"
        (click)="back($event)"
        class="grid size-11 shrink-0 place-items-center rounded-full text-ink-2 active:bg-surface-2"
        [attr.aria-label]="backLabel()"
      >
        <svg viewBox="0 0 24 24" class="size-6" fill="none" aria-hidden="true">
          <path
            d="M15 5l-7 7 7 7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </a>
      <h1 class="truncate text-lg font-semibold">{{ title() }}</h1>
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly backTo = input<string>('/');
  readonly backLabel = input<string>('Retour à l’accueil');
  /** Doit correspondre au gabarit du `main` de la page. */
  readonly width = input<'narrow' | 'wide' | 'prose'>('narrow');

  private readonly location = inject(Location);
  private readonly router = inject(Router);

  /** `href` conserve l'ouverture dans un nouvel onglet ; le clic simple reste dans l'app. */
  protected back(event: MouseEvent): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    const state = this.location.getState() as { navigationId?: number } | null;
    if ((state?.navigationId ?? 1) > 1) {
      this.location.back();
    } else {
      void this.router.navigateByUrl(this.backTo());
    }
  }

  protected readonly containerClass = computed(
    () => `page-${this.width()} flex items-center gap-1 py-2`,
  );
}
