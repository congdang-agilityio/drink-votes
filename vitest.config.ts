import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Local slots keep PORT / DATABASE_URL in .env.local; CI sets them in the environment.
// loadEnvFile never overrides variables that are already set.
if (existsSync('.env.local')) process.loadEnvFile('.env.local');

export default defineConfig({
  test: {
    // Test files share one database, so run them one at a time.
    fileParallelism: false,
  },
});
