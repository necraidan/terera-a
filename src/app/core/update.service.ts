import {
  ApplicationRef,
  DestroyRef,
  Injectable,
  InjectionToken,
  inject,
  signal,
} from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

/**
 * Injecté plutôt qu'appelé en dur : `location.reload` n'est pas espionnable sous
 * jsdomet la partie la plus critique du service resterait sinon non testée.
 */
export const RELOAD_PAGE = new InjectionToken<() => void>('RELOAD_PAGE', {
  providedIn: 'root',
  factory: () => () => document.location.reload(),
});

export type CheckOutcome = 'ready' | 'up-to-date' | 'error' | 'disabled';

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

/** Anti-rebond : un retour au premier plan ne revérifie pas avant ce délai. */
const FOREGROUND_THROTTLE_MS = 60 * 1000;

/**
 * Le service worker sert d'abord le cache : une nouvelle version n'apparaît donc
 * jamais au premier écran, mais en cours de session. C'est l'utilisateur qui
 * décide de recharger, jamais nous, sous peine de lui faire perdre une saisie.
 */
@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reloadPage = inject(RELOAD_PAGE);

  /** Une nouvelle version est téléchargée et prête à être activée. */
  readonly updateAvailable = signal(false);

  readonly checking = signal(false);

  readonly lastCheckedAt = signal<Date | null>(null);
  readonly checkFailed = signal(false);

  /** Faux en développement et partout où le service worker est désactivé. */
  readonly enabled = this.swUpdate.isEnabled;

  #lastCheckAt = 0;

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => this.updateAvailable.set(true));

    // Le cache du service worker est corrompu ou incomplet (iOS peut purger sous
    // pression de stockage) : seul un rechargement complet répare l'installation.
    this.swUpdate.unrecoverable.subscribe(() => this.reloadPage());

    void this.appRef.whenStable().then(() => void this.check());

    const interval = setInterval(() => void this.check(), CHECK_INTERVAL_MS);

    // Sur iPhone en standalone, l'app est suspendue dès qu'on la quitte : le
    // timer ci-dessus ne tourne qu'au premier plan. Le vrai déclencheur au
    // retour, c'est `visibilitychange` (et `pageshow` pour le cache de Safari).
    const onForeground = () => {
      if (document.visibilityState === 'visible') {
        void this.check();
      }
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void this.check();
      }
    };

    document.addEventListener('visibilitychange', onForeground);
    window.addEventListener('pageshow', onPageShow);

    this.destroyRef.onDestroy(() => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onForeground);
      window.removeEventListener('pageshow', onPageShow);
    });
  }

  /**
   * `checkForUpdate` ne résout qu'après avoir téléchargé la version complèteet
   * rejette hors ligne, cas fréquent pour une app de voyage.
   */
  async check(): Promise<CheckOutcome> {
    if (!this.swUpdate.isEnabled) {
      return 'disabled';
    }

    const now = Date.now();
    if (this.checking() || now - this.#lastCheckAt < FOREGROUND_THROTTLE_MS) {
      return this.updateAvailable() ? 'ready' : 'up-to-date';
    }
    this.#lastCheckAt = now;

    this.checking.set(true);
    this.checkFailed.set(false);
    try {
      const found = await this.swUpdate.checkForUpdate();
      this.lastCheckedAt.set(new Date());
      if (found) {
        this.updateAvailable.set(true);
      }
      return found ? 'ready' : 'up-to-date';
    } catch {
      this.checkFailed.set(true);
      return 'error';
    } finally {
      this.checking.set(false);
    }
  }

  /** Ignore l'anti-rebond : l'utilisateur a cliqué et attend une réponse. */
  checkNow(): Promise<CheckOutcome> {
    this.#lastCheckAt = 0;
    return this.check();
  }

  /**
   * Bascule sur la nouvelle version. Le rechargement suffit à lui seul, car le
   * service worker sert la dernière version prête à la prochaine navigation,
   * mais on active
   * explicitement d'abord pour ne pas dépendre de ce détail d'implémentation.
   */
  async applyUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
    } catch {
      // Rien à faire : le rechargement ci-dessous répare de toute façon l'état.
    }
    this.reloadPage();
  }
}
