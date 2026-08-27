import { ApplicationRef, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

/** Résultat d'une vérification manuelle, pour piloter le retour visuel. */
export type CheckOutcome = 'ready' | 'up-to-date' | 'error' | 'disabled';

/** Intervalle des vérifications automatiques quand l'app est au premier plan. */
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

/** Un retour au premier plan ne redéclenche pas de vérification avant ce délai. */
const FOREGROUND_THROTTLE_MS = 60 * 1000;

/**
 * Détection et application des mises à jour de la PWA.
 *
 * Le service worker sert toujours la version en cache d'abord (offline-first) :
 * une nouvelle version n'est donc jamais visible au premier écran. Elle est
 * détectée en tâche de fond, puis signalée par `updateAvailable` — c'est
 * l'utilisateur qui décide de recharger, jamais nous (un reload automatique
 * ferait perdre une saisie en cours).
 */
@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Une nouvelle version est téléchargée et prête à être activée. */
  readonly updateAvailable = signal(false);

  /** Une vérification est en cours (le téléchargement peut prendre du temps). */
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
    this.swUpdate.unrecoverable.subscribe(() => document.location.reload());

    // Première vérification une fois l'app stable — le service worker
    // s'enregistre lui-même via `registerWhenStable`, inutile de le devancer.
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
   * Interroge le serveur : une nouvelle version existe-t-elle ?
   *
   * `checkForUpdate()` ne résout qu'après avoir téléchargé la version complète,
   * et rejette hors ligne — cas fréquent pour une app de voyage.
   */
  async check(): Promise<CheckOutcome> {
    if (!this.swUpdate.isEnabled) {
      return 'disabled';
    }

    // Les vérifications automatiques sont nombreuses (retour au premier plan à
    // chaque déverrouillage) : on évite de marteler le réseau.
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

  /**
   * Force une vérification en ignorant l'anti-rebond : utilisé par le bouton
   * « Vérifier les mises à jour », où l'utilisateur attend une réponse.
   */
  checkNow(): Promise<CheckOutcome> {
    this.#lastCheckAt = 0;
    return this.check();
  }

  /**
   * Bascule sur la nouvelle version. Le rechargement suffit — le service worker
   * sert la dernière version prête à la prochaine navigation — mais on active
   * explicitement d'abord pour ne pas dépendre de ce détail d'implémentation.
   */
  async applyUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
    } catch {
      // Rien à faire : le rechargement ci-dessous répare de toute façon l'état.
    }
    document.location.reload();
  }
}
