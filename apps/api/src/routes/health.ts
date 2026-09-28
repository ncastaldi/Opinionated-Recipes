import type { FastifyPluginCallback } from 'fastify';

/**
 * Liveness only: the process is up and serving HTTP. It deliberately does not
 * check Postgres or Redis, so a dependency blip does not get the container
 * restarted in a loop. A readiness check that does will arrive with the first
 * database-backed route.
 */
export const healthRoutes: FastifyPluginCallback = (app, _options, done) => {
  app.get(
    '/healthz',
    {
      schema: {
        summary: 'Liveness check',
        response: {
          200: {
            type: 'object',
            properties: { status: { type: 'string', const: 'ok' } },
            required: ['status'],
          },
        },
      },
    },
    (_request, reply) => reply.send({ status: 'ok' }),
  );
  done();
};
