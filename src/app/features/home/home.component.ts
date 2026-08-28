import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpdateService } from '../../core/update.service';
import { WhatsNewService } from '../../core/whats-new.service';
import { ToolCardComponent } from '../../shared/ui/tool-card.component';

interface Tool {
  readonly icon: string;
  readonly label: string;
  readonly hint: string;
  readonly route: string;
}

const TOOLS: readonly Tool[] = [
  {
    icon: '💰',
    label: 'Convertisseur',
    hint: 'Franc pacifique ↔ Euro',
    route: '/convertisseur',
  },
  { icon: '💵', label: 'Billets et pièces', hint: 'Reconnaître les espèces', route: '/especes' },
  { icon: '🕐', label: 'Heure', hint: 'Tahiti et la France', route: '/horloge' },
  { icon: '📐', label: 'Unités', hint: 'Milles, nœuds, pieds', route: '/unites' },
  { icon: '🌊', label: 'Soleil et marées', hint: 'Par île, hors ligne', route: '/soleil-marees' },
  { icon: '🗺️', label: 'Carte et distances', hint: 'Les cinq archipels', route: '/carte' },
  { icon: '🐋', label: 'Faune marine', hint: 'Saisons et distances', route: '/faune' },
  { icon: '🥾', label: 'Randonnées', hint: 'Sentiers par île et niveau', route: '/randonnees' },
  { icon: '🗣️', label: 'Lexique', hint: 'Parler quelques mots', route: '/lexique' },
  { icon: '📌', label: 'Infos pratiques', hint: 'Urgences, prises, usages', route: '/infos' },
  { icon: '🔗', label: 'Liens utiles', hint: 'Sites officiels, météo', route: '/liens' },
];

@Component({
  selector: 'ta-home',
  imports: [RouterLink, ToolCardComponent],
  template: `
    <main class="page-wide" style="padding-top: env(safe-area-inset-top)">
      <header class="flex items-start justify-between gap-3 pt-4 pb-6">
        <div>
          <p class="text-2xl font-bold">Terera'a 🌺</p>
          <p class="text-ink-2">La boite à outils pour la Polynésie Française.</p>
        </div>
        <a
          routerLink="/reglages"
          class="relative grid size-11 shrink-0 place-items-center rounded-full bg-surface-1 text-ink-2 active:bg-surface-2"
          aria-label="Réglages"
        >
          <svg viewBox="0 0 24 24" class="size-6" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          @if (badge()) {
            <span
              class="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-coral ring-2 ring-surface-1"
              aria-hidden="true"
            ></span>
          }
        </a>
      </header>

      <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        @for (tool of tools; track tool.route) {
          <li class="contents">
            <ta-tool-card
              [icon]="tool.icon"
              [label]="tool.label"
              [hint]="tool.hint"
              [route]="tool.route"
            />
          </li>
        }
      </ul>
    </main>
  `,
})
export class HomeComponent {
  protected readonly tools = TOOLS;

  private readonly whatsNew = inject(WhatsNewService);
  private readonly update = inject(UpdateService);

  /** Pastille sur l'engrenage : nouveautés non lues ou mise à jour en attente. */
  protected readonly badge = computed(
    () => this.whatsNew.hasUnseenChanges() || this.update.updateAvailable(),
  );
}
