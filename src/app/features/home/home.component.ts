import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
    hint: 'Euro ↔ franc pacifique',
    route: '/convertisseur',
  },
  { icon: '🕐', label: 'Heure', hint: 'Tahiti et la France', route: '/horloge' },
  { icon: '🗣️', label: 'Lexique', hint: 'Parler quelques mots', route: '/lexique' },
  { icon: '📌', label: 'Infos pratiques', hint: 'Urgences, prises, usages', route: '/infos' },
];

@Component({
  selector: 'ta-home',
  imports: [RouterLink, ToolCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-md px-4 pb-28" style="padding-top: env(safe-area-inset-top)">
      <header class="flex items-start justify-between gap-3 pt-4 pb-6">
        <div>
          <p class="text-2xl font-bold">Ia ora na 🌺</p>
          <p class="text-ink-2">Votre boîte à outils, même sans réseau.</p>
        </div>
        <a
          routerLink="/reglages"
          class="relative grid size-11 shrink-0 place-items-center rounded-full bg-surface-1 text-ink-2 active:bg-surface-2"
          aria-label="Réglages"
        >
          <svg viewBox="0 0 24 24" class="size-6" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
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

      <ul class="grid grid-cols-2 gap-3">
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
