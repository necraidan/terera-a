import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * En-tête d'un écran : flèche de retour et titre.
 *
 * `sticky` avec un padding haut en safe-area, pour rester sous l'encoche en
 * standalone iPhone. La largeur suit celle de la page, sans quoi la flèche se
 * retrouverait seule au bord de l'écran sur desktop.
 */
@Component({
  selector: 'ta-page-header',
  imports: [RouterLink],
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
        [routerLink]="backTo()"
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

  protected readonly containerClass = computed(
    () => `page-${this.width()} flex items-center gap-1 py-2`,
  );
}
