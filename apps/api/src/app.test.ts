import { loadConfig } from '@opinionated-recipes/config';
import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from './app.ts';

const apps: Awaited<ReturnType<typeof buildApp>>[] = [];

async function appWith(env: NodeJS.ProcessEnv) {
  const app = await buildApp(loadConfig({ RECIPES_LOG_LEVEL: 'silent', ...env }));
  apps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe('GET /api/healthz', () => {
  it('reports the process as up', async () => {
    const app = await appWith({});

    const response = await app.inject({ method: 'GET', url: '/api/healthz' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});

describe('API docs (RECIPES_FEATURE_API_DOCS)', () => {
  it('serves an OpenAPI document listing the real routes when on', async () => {
    const app = await appWith({ RECIPES_FEATURE_API_DOCS: 'true' });

    const response = await app.inject({ method: 'GET', url: '/api/docs/json' });

    expect(response.statusCode).toBe(200);
    const document = response.json<{ openapi: string; paths: Record<string, unknown> }>();
    expect(document.openapi).toMatch(/^3\./);
    expect(Object.keys(document.paths)).toContain('/api/healthz');
  });

  it('does not exist at all when switched off', async () => {
    const app = await appWith({ RECIPES_FEATURE_API_DOCS: 'false' });

    const json = await app.inject({ method: 'GET', url: '/api/docs/json' });
    const ui = await app.inject({ method: 'GET', url: '/api/docs' });

    expect(json.statusCode).toBe(404);
    expect(ui.statusCode).toBe(404);
  });
});
