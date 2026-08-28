import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_VERSION } from '../../core/version';

/**
 * Pied de page : mentions légales, sources des données et code source.
 *
 * Placé une fois sous le `router-outlet`, donc présent sous chaque écran. Il
 * suit simplement le flux : aucune marge négative, certaines pages n'ont pas
 * de réserve en bas et le pied de page chevaucherait leur contenu. Les liens internes fonctionnent hors ligne ; seul
 * le dépôt demande une connexion.
 */
@Component({
  selector: 'ta-footer',
  imports: [RouterLink],
  template: `
    <footer
      class="page-wide mt-10 mb-6 border-t border-surface-2 pt-6 text-center text-sm text-ink-2"
      style="padding-bottom: env(safe-area-inset-bottom)"
    >
      <nav aria-label="Pied de page">
        <ul class="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <li>
            <a routerLink="/mentions-legales" class="underline-offset-2 hover:underline"
              >Mentions légales</a
            >
          </li>
          <li>
            <a
              routerLink="/mentions-legales"
              fragment="sources"
              class="underline-offset-2 hover:underline"
              >Sources des données</a
            >
          </li>
          <li>
            <a
              href="https://github.com/necraidan/terera-a"
              target="_blank"
              rel="noopener noreferrer"
              class="underline-offset-2 hover:underline"
              >Code source</a
            >
          </li>
        </ul>
      </nav>
      <p class="mt-3 text-xs">© {{ year }} necraidan · Terera’a v{{ version }}</p>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly version = APP_VERSION;
  protected readonly year = new Date().getFullYear();
}
