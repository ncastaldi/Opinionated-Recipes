import { defineConfig } from 'vitest/config';

// Each app and package is its own Vitest project, so `pnpm test` at the root
// runs everything while a package's own config (the SPA's Vite config, say)
// still applies to its tests. Playwright specs in e2e/ are not picked up here.
export default defineConfig({
  test: {
    // A glob matches files as well as folders; skip the READMEs beside the packages.
    projects: ['{apps,packages}/*', '!{apps,packages}/*.md'],
  },
});
