import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ta-not-found',
  imports: [RouterLink],
  template: `
    <main class="mx-auto grid min-h-dvh max-w-md place-items-center px-4 text-center">
      <div>
        <p class="text-5xl" aria-hidden="true">🧭</p>
        <h1 class="mt-3 text-xl font-semibold">Page introuvable</h1>
        <p class="mt-1 text-ink-2">Cette page n’existe pas (ou plus).</p>
        <a
          routerLink="/"
          class="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-semibold text-accent-ink"
        >
          Retour à l’accueil
        </a>
      </div>
    </main>
  `,
})
export class NotFoundComponent {}
