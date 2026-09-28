import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.ts';

export { schema };

export interface Database {
  db: ReturnType<typeof drizzle<typeof schema>>;
  close: () => Promise<void>;
}

/** Open a connection pool. Callers own the lifecycle and must `close()` it on shutdown. */
export function createDatabase(databaseUrl: string): Database {
  const client = postgres(databaseUrl);
  const db = drizzle({ client, schema, casing: 'snake_case' });
  return {
    db,
    close: () => client.end(),
  };
}
