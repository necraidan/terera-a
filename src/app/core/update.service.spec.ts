import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  SwUpdate,
  UnrecoverableStateEvent,
  VersionEvent,
  VersionReadyEvent,
} from '@angular/service-worker';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { IS_ONLINE, RELOAD_PAGE, UpdateService } from './update.service';

const THROTTLE_MS = 60 * 1000;

/** Une version prête à activer, telle que la pousse le service worker. */
const versionReady = (hash: string): VersionReadyEvent => ({
  type: 'VERSION_READY',
  currentVersion: { hash: 'ancienne' },
  latestVersion: { hash },
});

/** Le service worker signale une ressource introuvable dans son cache. */
const damaged: UnrecoverableStateEvent = {
  type: 'UNRECOVERABLE_STATE',
  reason: 'ressource absente du cache',
};

interface Harness {
  readonly service: UpdateService;
  readonly versionUpdates: Subject<VersionEvent>;
  readonly unrecoverable: Subject<UnrecoverableStateEvent>;
  readonly checkForUpdate: ReturnType<typeof vi.fn>;
  readonly activateUpdate: ReturnType<typeof vi.fn>;
  readonly reload: ReturnType<typeof vi.fn>;
  /** Fait avancer l'horloge, pour sortir de la fenêtre d'anti-rebond. */
  advance(ms: number): void;
  /** Simule le passage en mode avion, ou le retour du réseau. */
  setOnline(value: boolean): void;
}

/**
 * Instancie le service avec un `SwUpdate` simulé.
 *
 * La vérification de démarrage est attendue puis les compteurs sont remis à
 * zéro : chaque test part d'un état propre et n'observe que ses propres appels.
 */
async function setup({ enabled = true, online = true } = {}): Promise<Harness> {
  const versionUpdates = new Subject<VersionEvent>();
  const unrecoverable = new Subject<UnrecoverableStateEvent>();
  const checkForUpdate = vi.fn().mockResolvedValue(false);
  const activateUpdate = vi.fn().mockResolvedValue(true);
  const reload = vi.fn();

  let now = 1_000_000;
  vi.spyOn(Date, 'now').mockImplementation(() => now);

  let connected = online;

  TestBed.configureTestingModule({
    providers: [
      {
        provide: SwUpdate,
        useValue: {
          isEnabled: enabled,
          versionUpdates,
          unrecoverable,
          checkForUpdate,
          activateUpdate,
        },
      },
      { provide: RELOAD_PAGE, useValue: reload },
      { provide: IS_ONLINE, useValue: () => connected },
    ],
  });

  const service = TestBed.inject(UpdateService);

  // Le constructeur déclenche une vérification dès que l'app est stable.
  await TestBed.inject(ApplicationRef).whenStable();
  await Promise.resolve();

  return {
    service,
    versionUpdates,
    unrecoverable,
    checkForUpdate,
    activateUpdate,
    reload,
    advance(ms: number) {
      now += ms;
    },
    setOnline(value: boolean) {
      connected = value;
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  TestBed.resetTestingModule();
});

describe('UpdateService, service worker désactivé', () => {
  it('ne s’abonne à rien et signale l’indisponibilité', async () => {
    const { service, checkForUpdate, versionUpdates } = await setup({ enabled: false });

    expect(service.enabled).toBe(false);
    expect(checkForUpdate).not.toHaveBeenCalled();
    expect(await service.check()).toBe('disabled');

    // Sans service worker, une erreur de navigation n'a rien à voir avec un cache.
    service.reportBrokenCache();
    expect(service.cacheDamaged()).toBe(false);

    // Même si un évènement arrivait, aucun abonnement ne doit l'écouter.
    versionUpdates.next(versionReady('nouvelle'));
    expect(service.updateAvailable()).toBe(false);
  });
});

describe('UpdateService, détection', () => {
  it('vérifie une première fois au démarrage', async () => {
    // Le compteur n'est pas remis à zéro ici : on observe l'appel du constructeur.
    const checkForUpdate = vi.fn().mockResolvedValue(false);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates: new Subject<VersionEvent>(),
            unrecoverable: new Subject<UnrecoverableStateEvent>(),
            checkForUpdate,
            activateUpdate: vi.fn(),
          },
        },
        { provide: RELOAD_PAGE, useValue: vi.fn() },
      ],
    });

    TestBed.inject(UpdateService);
    await TestBed.inject(ApplicationRef).whenStable();
    await Promise.resolve();

    expect(checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('signale une version prête sur VERSION_READY', async () => {
    const { service, versionUpdates } = await setup();

    expect(service.updateAvailable()).toBe(false);
    versionUpdates.next(versionReady('nouvelle'));
    expect(service.updateAvailable()).toBe(true);
  });

  it('ne signale rien quand l’installation d’une version échoue', async () => {
    const { service, versionUpdates } = await setup();

    versionUpdates.next({
      type: 'VERSION_INSTALLATION_FAILED',
      version: { hash: 'nouvelle' },
      error: 'téléchargement interrompu',
    });

    expect(service.updateAvailable()).toBe(false);
  });

  it('revérifie au retour de l’app au premier plan', async () => {
    const { checkForUpdate, advance } = await setup();
    checkForUpdate.mockClear();

    advance(THROTTLE_MS + 1);
    document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();

    expect(checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('revérifie quand Safari restaure la page depuis son cache', async () => {
    const { checkForUpdate, advance } = await setup();
    checkForUpdate.mockClear();

    advance(THROTTLE_MS + 1);
    // `persisted: true` distingue une restauration d'un chargement normal.
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    await Promise.resolve();

    expect(checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('ignore un pageshow qui n’est pas une restauration', async () => {
    const { checkForUpdate, advance } = await setup();
    checkForUpdate.mockClear();

    advance(THROTTLE_MS + 1);
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }));
    await Promise.resolve();

    expect(checkForUpdate).not.toHaveBeenCalled();
  });
});

describe('UpdateService, anti-rebond', () => {
  it('ne martèle pas le réseau à deux retours rapprochés', async () => {
    const { service, checkForUpdate, advance } = await setup();
    checkForUpdate.mockClear();

    advance(THROTTLE_MS + 1);
    await service.check();
    expect(checkForUpdate).toHaveBeenCalledTimes(1);

    // Deuxième retour au premier plan quelques secondes plus tard : rien.
    advance(5_000);
    await service.check();
    expect(checkForUpdate).toHaveBeenCalledTimes(1);

    // Passé la fenêtre, la vérification repart.
    advance(THROTTLE_MS);
    await service.check();
    expect(checkForUpdate).toHaveBeenCalledTimes(2);
  });

  it('laisse passer une vérification demandée explicitement', async () => {
    const { service, checkForUpdate } = await setup();
    checkForUpdate.mockClear();

    // Aucune avance d'horloge : `check()` serait bloqué, `checkNow()` ne l'est pas.
    await service.check();
    expect(checkForUpdate).not.toHaveBeenCalled();

    await service.checkNow();
    expect(checkForUpdate).toHaveBeenCalledTimes(1);
  });
});

describe('UpdateService, résultat des vérifications', () => {
  it('rapporte une version prête', async () => {
    const { service, checkForUpdate } = await setup();
    checkForUpdate.mockResolvedValue(true);

    expect(await service.checkNow()).toBe('ready');
    expect(service.updateAvailable()).toBe(true);
    expect(service.lastCheckedAt()).toBeInstanceOf(Date);
    expect(service.checkFailed()).toBe(false);
    expect(service.checking()).toBe(false);
  });

  it('rapporte une app à jour', async () => {
    const { service } = await setup();

    expect(await service.checkNow()).toBe('up-to-date');
    expect(service.updateAvailable()).toBe(false);
    expect(service.lastCheckedAt()).toBeInstanceOf(Date);
  });

  it('rapporte une erreur hors ligne sans lever', async () => {
    const { service, checkForUpdate } = await setup();
    checkForUpdate.mockRejectedValue(new Error('réseau indisponible'));

    expect(await service.checkNow()).toBe('error');
    expect(service.checkFailed()).toBe(true);
    // L'indicateur d'activité doit retomber, sinon le bouton reste bloqué.
    expect(service.checking()).toBe(false);
  });

  it('efface l’erreur précédente à la vérification suivante', async () => {
    const { service, checkForUpdate } = await setup();

    checkForUpdate.mockRejectedValue(new Error('réseau indisponible'));
    await service.checkNow();
    expect(service.checkFailed()).toBe(true);

    checkForUpdate.mockResolvedValue(false);
    await service.checkNow();
    expect(service.checkFailed()).toBe(false);
  });
});

describe('UpdateService, application de la mise à jour', () => {
  it('active la nouvelle version puis recharge', async () => {
    const { service, activateUpdate, reload } = await setup();

    await service.applyUpdate();

    expect(activateUpdate).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('recharge quand même si l’activation échoue, en ligne', async () => {
    const { service, activateUpdate, reload } = await setup();
    activateUpdate.mockRejectedValue(new Error('activation refusée'));

    await service.applyUpdate();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('ne recharge pas sur une activation échouée hors ligne', async () => {
    const { service, activateUpdate, reload } = await setup({ online: false });
    activateUpdate.mockRejectedValue(new Error('activation refusée'));

    await service.applyUpdate();

    // Sans réseau, la coquille peut manquer au cache : recharger tuerait l'app.
    expect(reload).not.toHaveBeenCalled();
  });

  it('ne recharge jamais de lui-même quand une version devient prête', async () => {
    const { versionUpdates, reload } = await setup();

    versionUpdates.next(versionReady('nouvelle'));

    // Un rechargement automatique ferait perdre une saisie en cours.
    expect(reload).not.toHaveBeenCalled();
  });

  it('recharge sur un état irrécupérable du cache, en ligne', async () => {
    const { service, unrecoverable, reload } = await setup();

    unrecoverable.next(damaged);

    expect(reload).toHaveBeenCalledTimes(1);
    expect(service.cacheDamaged()).toBe(true);
  });
});

describe('UpdateService, cache abîmé hors ligne', () => {
  it('ne recharge pas et laisse l’app dégradée en vie', async () => {
    const { service, unrecoverable, reload } = await setup({ online: false });

    unrecoverable.next(damaged);

    // Recharger hors ligne échangerait l'app contre la page d'erreur de Safari.
    expect(reload).not.toHaveBeenCalled();
    expect(service.cacheDamaged()).toBe(true);
  });

  it('recharge dès le retour du réseau', async () => {
    const { unrecoverable, reload, setOnline } = await setup({ online: false });

    unrecoverable.next(damaged);
    expect(reload).not.toHaveBeenCalled();

    setOnline(true);
    window.dispatchEvent(new Event('online'));

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('signale un écran introuvable sans tuer l’app', async () => {
    const { service, reload } = await setup({ online: false });

    // Un morceau de code manquant hors ligne : le routeur échoue, mais l'app
    // affichée reste utilisable.
    service.reportBrokenCache();

    expect(service.cacheDamaged()).toBe(true);
    expect(reload).not.toHaveBeenCalled();
  });

  it('ne recharge qu’une fois même si plusieurs écrans échouent', async () => {
    const { service, reload } = await setup();

    service.reportBrokenCache();
    service.reportBrokenCache();

    // Une boucle de rechargements serait pire que l'écran manquant.
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('ne recharge pas au retour du réseau si le cache est sain', async () => {
    const { reload, setOnline } = await setup({ online: false });

    setOnline(true);
    window.dispatchEvent(new Event('online'));

    expect(reload).not.toHaveBeenCalled();
  });
});
