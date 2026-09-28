import { loadConfig } from '@opinionated-recipes/config';
import { defineConfig } from 'drizzle-kit';

// Read the connection string through the config package like every other
// entrypoint, so RECIPES_DATABASE_URL has one definition and one default.
const { databaseUrl } = loadConfig();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: { url: databaseUrl },
  casing: 'snake_case',
});
