import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpdateService } from '../../core/update.service';
import { APP_VERSION } from '../../core/version';
import { WhatsNewService } from '../../core/whats-new.service';
import { XPF_PER_EUR } from '../../shared/data/currency';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'ta-settings',
  imports: [RouterLink, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ta-page-header title="Réglages" />

    <main class="mx-auto max-w-md px-4 pb-28">
      <ul class="overflow-hidden rounded-card bg-surface-1">
        <li class="flex items-center justify-between gap-3 border-b border-surface-2 p-4">
          <span class="text-ink-2">Version</span>
          <span class="font-semibold tabular-nums">{{ appVersion }}</span>
        </li>
        <li>
          <a
            routerLink="/reglages/changelog"
            class="flex items-center gap-3 p-4 active:bg-surface-2"
          >
            <span class="flex-1 font-medium">Nouveautés</span>
            @if (badge()) {
              <span class="size-2.5 rounded-full bg-coral" aria-label="Nouveautés non lues"></span>
            }
            <svg viewBox="0 0 24 24" class="size-5 text-ink-2" fill="none" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </li>
      </ul>

      <h2 class="mt-8 mb-2 text-sm font-semibold tracking-wide text-ink-2 uppercase">À propos</h2>
      <div class="rounded-card bg-surface-1 p-4 text-sm leading-relaxed text-ink-2">
        <p>
          <strong class="text-ink-1">Terera’a</strong> — « le voyage » en tahitien. Une boîte à
          outils pensée pour être utile là où il n’y a pas de réseau : toutes les données sont
          embarquées dans l’application.
        </p>
        <p class="mt-3">
          Le convertisseur repose sur la parité fixe légale du franc pacifique (1 € =
          {{ rateLabel }} F), qui ne varie pas. Aucune donnée n’est envoyée nulle part, et l’app ne
          demande aucune autorisation.
        </p>
      </div>
    </main>
  `,
})
export class SettingsComponent {
  protected readonly appVersion = APP_VERSION;

  protected readonly rateLabel = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 6,
  }).format(XPF_PER_EUR);

  private readonly whatsNew = inject(WhatsNewService);
  private readonly update = inject(UpdateService);

  protected readonly badge = computed(
    () => this.whatsNew.hasUnseenChanges() || this.update.updateAvailable(),
  );
}
