import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { APP_VERSION } from '../../core/version';
import { CheckOutcome, UpdateService } from '../../core/update.service';
import { WhatsNewService } from '../../core/whats-new.service';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { CHANGELOG } from './changelog.data';

@Component({
  selector: 'ta-changelog',
  imports: [DatePipe, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ta-page-header title="Nouveautés" backTo="/reglages" backLabel="Retour aux réglages" />

    <main class="mx-auto max-w-md px-4 pb-28">
      <section class="rounded-card bg-surface-1 p-4">
        <p class="text-sm text-ink-2">Version installée</p>
        <p class="text-2xl font-bold">{{ appVersion }}</p>

        @if (!update.enabled) {
          <p class="mt-3 text-sm text-ink-2">
            Les mises à jour ne sont pas gérées ici : le service worker est désactivé (mode
            développement ou navigateur sans support).
          </p>
        } @else if (update.updateAvailable()) {
          <p class="mt-3 text-sm">
            Une nouvelle version est téléchargée et prête. L’app va redémarrer.
          </p>
          <button
            type="button"
            class="mt-3 min-h-11 w-full rounded-full bg-accent px-4 font-semibold text-accent-ink active:scale-[0.98]"
            (click)="update.applyUpdate()"
          >
            Mettre à jour maintenant
          </button>
        } @else {
          <button
            type="button"
            class="mt-3 min-h-11 w-full rounded-full bg-surface-2 px-4 font-semibold active:scale-[0.98] disabled:opacity-60"
            [disabled]="update.checking()"
            (click)="checkForUpdate()"
          >
            {{ update.checking() ? 'Vérification…' : 'Vérifier les mises à jour' }}
          </button>

          @if (statusMessage(); as message) {
            <p
              class="mt-3 text-sm"
              [class]="lastOutcome() === 'error' ? 'text-danger' : 'text-ink-2'"
            >
              {{ message }}
            </p>
          }
        }
      </section>

      <h2 class="mt-8 mb-2 text-sm font-semibold tracking-wide text-ink-2 uppercase">
        Journal des versions
      </h2>

      @for (entry of changelog; track entry.version) {
        <section class="mb-3 rounded-card bg-surface-1 p-4">
          <div class="flex items-baseline gap-2">
            <h3 class="text-lg font-semibold">{{ entry.version }}</h3>
            @if (isUnseen(entry.version)) {
              <span class="rounded-full bg-coral px-2 py-0.5 text-xs font-semibold text-surface-1">
                Nouveau
              </span>
            }
            <span class="ml-auto text-sm text-ink-2">{{ entry.date | date: 'd MMMM y' }}</span>
          </div>
          <ul class="mt-2 grid gap-1.5">
            @for (change of entry.changes; track $index) {
              <li class="flex gap-2 text-sm leading-relaxed">
                <span class="text-accent" aria-hidden="true">•</span>
                <span>{{ change }}</span>
              </li>
            }
          </ul>
        </section>
      }
    </main>
  `,
})
export class ChangelogComponent {
  protected readonly update = inject(UpdateService);

  protected readonly appVersion = APP_VERSION;
  protected readonly changelog = CHANGELOG;

  protected readonly lastOutcome = signal<CheckOutcome | null>(null);

  /**
   * Version lue lors du rendu, avant de marquer les nouveautés comme vues :
   * sans cette copie, le badge « Nouveau » disparaîtrait aussitôt affiché.
   */
  private readonly versionOnEntry: string | null;

  protected readonly statusMessage = computed(() => {
    switch (this.lastOutcome()) {
      case 'up-to-date': {
        const at = this.update.lastCheckedAt();
        const time = at
          ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(at)
          : null;
        return time ? `Vous êtes à jour (vérifié à ${time}).` : 'Vous êtes à jour.';
      }
      case 'error':
        return 'Vérification impossible — vérifiez votre connexion, puis réessayez.';
      default:
        return null;
    }
  });

  constructor() {
    const whatsNew = inject(WhatsNewService);
    this.versionOnEntry = whatsNew.lastSeenVersion();
    // L'utilisateur consulte les nouveautés : la pastille n'a plus lieu d'être.
    whatsNew.markSeen();
  }

  protected async checkForUpdate(): Promise<void> {
    this.lastOutcome.set(await this.update.checkNow());
  }

  /** Une version est « nouvelle » si elle est postérieure à la dernière vue. */
  protected isUnseen(version: string): boolean {
    return this.versionOnEntry !== null && version !== this.versionOnEntry;
  }
}
