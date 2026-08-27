import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * En-tête d'un écran outil : flèche de retour + titre.
 *
 * `sticky top-0` avec un padding haut en safe-area : en standalone iPhone
 * l'en-tête reste sous l'encoche même quand la page défile.
 */
@Component({
  selector: 'ta-page-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    <div class="flex items-center gap-1 px-2 py-2">
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
}
