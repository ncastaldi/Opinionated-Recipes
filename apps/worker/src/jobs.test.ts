import { describe, expect, it } from 'vitest';

import { processJob, UnknownJobError } from './jobs.ts';

describe('processJob', () => {
  it('runs the handler registered for the job name', async () => {
    await expect(processJob({ name: 'ping', data: { from: 'api' } })).resolves.toEqual({
      pong: { from: 'api' },
    });
  });

  it('fails a job with no registered handler instead of completing it', async () => {
    const result = processJob({ name: 'embed-recipe', data: {} });

    await expect(result).rejects.toBeInstanceOf(UnknownJobError);
    await expect(result).rejects.toThrow('No handler registered for job "embed-recipe"');
  });
});
