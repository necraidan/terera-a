import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Cf. src/testing/zone-testing-stub.ts : permet de se passer entièrement
      // de la dépendance zone.js sur une application zoneless.
      'zone.js/testing': fileURLToPath(
        new URL('./src/testing/zone-testing-stub.ts', import.meta.url),
      ),
    },
  },
});
