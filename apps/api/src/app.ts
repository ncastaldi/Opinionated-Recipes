import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { Config } from '@opinionated-recipes/config';
import Fastify, { type FastifyInstance } from 'fastify';

import { healthRoutes } from './routes/health.ts';

export const API_PREFIX = '/api';
export const API_DOCS_PATH = `${API_PREFIX}/docs`;

/**
 * Build the Fastify app without listening. Tests drive it with `inject()`;
 * `server.ts` is the only place that binds a port.
 *
 * Every feature registers here behind its switch in `config.features`. A
 * disabled feature's routes are never registered, so they 404 rather than
 * existing in a half-off state.
 */
export async function buildApp(config: Config): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: config.logLevel } });

  if (config.features.apiDocs) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: 'Opinionated Recipes API',
          version: '0.1.0',
        },
      },
    });
    await app.register(swaggerUi, { routePrefix: API_DOCS_PATH });
  }

  await app.register(healthRoutes, { prefix: API_PREFIX });

  return app;
}
