/** The one queue every job goes through. Job names, not queues, separate the work. */
export const QUEUE_NAME = 'recipes';

export interface JobLike {
  name: string;
  data: unknown;
}

type Handler = (data: unknown) => Promise<unknown>;

/**
 * Job name → handler. Import, normalize and embed handlers land here as those
 * features are built, each registered only when its feature switch is on.
 */
export const handlers: Readonly<Record<string, Handler>> = {
  // Round-trip check for the queue itself: enqueue `ping`, get the payload back.
  ping: (data) => Promise.resolve({ pong: data }),
};

export class UnknownJobError extends Error {
  constructor(name: string) {
    super(`No handler registered for job "${name}"`);
    this.name = 'UnknownJobError';
  }
}

/**
 * Route a job to its handler. An unknown name fails the job loudly rather than
 * completing it as a no-op: a producer enqueueing work for a disabled or
 * misspelled handler must see a failed job, not a silent success.
 */
export function processJob(job: JobLike, registry = handlers): Promise<unknown> {
  const handler = registry[job.name];
  if (!handler) {
    return Promise.reject(new UnknownJobError(job.name));
  }
  return handler(job.data);
}
