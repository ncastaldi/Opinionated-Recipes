import { loadConfig } from '@opinionated-recipes/config';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

import { processJob, QUEUE_NAME } from './jobs.ts';

const config = loadConfig();

// BullMQ 6 treats ioredis as optional and, under native ESM, needs an
// already-constructed client rather than connection options. BullMQ requires
// maxRetriesPerRequest: null so a Redis blip stalls a job instead of failing it.
const connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });

const worker = new Worker(QUEUE_NAME, (job) => processJob(job), { connection });

worker.on('ready', () => {
  console.info(`worker: listening on queue "${QUEUE_NAME}"`);
});
worker.on('failed', (job, error) => {
  console.error(`worker: job ${job?.name ?? '?'} (${job?.id ?? '?'}) failed: ${error.message}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    console.info(`worker: ${signal} received, finishing current jobs`);
    worker
      .close()
      .then(() => connection.quit())
      .then(
        () => process.exit(0),
        (error: unknown) => {
          console.error('worker: error during shutdown', error);
          process.exit(1);
        },
      );
  });
}
