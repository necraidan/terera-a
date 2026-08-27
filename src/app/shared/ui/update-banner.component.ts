import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpdateService } from '../../core/update.service';

/**
 * Bandeau signalant qu'une nouvelle version est prête.
 *
 * Posé en bas de l'écran (zone du pouce sur iPhone) et décalé de la barre home
 * via la safe-area. Le rejet ne vaut que pour la session : la mise à jour sera
 * re-proposée au prochain lancement si elle n'a pas été appliquée.
 */
@Component({
  selector: 'ta-update-banner',
  imports: [RouterLink],
  styles: `
    :host {
      position: fixed;
      inset-inline: 0;
      bottom: 0;
      z-index: 50;
      padding: 0.75rem 0.75rem calc(0.75rem + env(safe-area-inset-bottom));
      pointer-events: none;
    }
  `,
  template: `
    @if (update.updateAvailable() && !dismissed()) {
      <div
        class="pointer-events-auto mx-auto flex max-w-md items-center gap-3 rounded-card bg-ink-1 p-3 text-surface-1 shadow-lg"
        role="status"
      >
        <span class="text-xl" aria-hidden="true">🎉</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold">Nouvelle version disponible</p>
          <a routerLink="/reglages/changelog" class="text-sm underline underline-offset-2">
            Voir les nouveautés
          </a>
        </div>
        <button
          type="button"
          class="min-h-11 shrink-0 rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink"
          (click)="update.applyUpdate()"
        >
          Mettre à jour
        </button>
        <button
          type="button"
          class="grid size-11 shrink-0 place-items-center rounded-full text-surface-2"
          aria-label="Masquer"
          (click)="dismissed.set(true)"
        >
          <svg viewBox="0 0 24 24" class="size-5" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    }
  `,
})
export class UpdateBannerComponent {
  protected readonly update = inject(UpdateService);
  protected readonly dismissed = signal(false);
}
