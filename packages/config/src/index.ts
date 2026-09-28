import { z } from 'zod';

/**
 * Every setting and feature switch Opinionated Recipes reads, in one place.
 *
 * This module is the only code that touches `process.env`. Services call
 * `loadConfig()` once at startup and pass the result down, so a setting that
 * is not declared here does not exist. `.env.example` documents the same
 * variables for operators; keep the two in step.
 */

const flag = (defaultValue: boolean) => z.stringbool().default(defaultValue);

const envSchema = z.object({
  RECIPES_LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  RECIPES_API_HOST: z.string().default('0.0.0.0'),
  RECIPES_API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  RECIPES_PUBLIC_URL: z.url().default('http://localhost:8080'),

  // No credentials in the default: a password is always supplied, never assumed.
  RECIPES_DATABASE_URL: z.url().default('postgres://localhost:5432/recipes'),
  RECIPES_REDIS_URL: z.url().default('redis://localhost:6379'),

  RECIPES_AUTH_PASSWORD: z.string().optional(),
  RECIPES_SESSION_SECRET: z.string().min(32).optional(),
  RECIPES_OIDC_ISSUER_URL: z.url().optional(),
  RECIPES_OIDC_CLIENT_ID: z.string().optional(),
  RECIPES_OIDC_CLIENT_SECRET: z.string().optional(),

  RECIPES_OLLAMA_URL: z.url().default('http://localhost:11434'),
  RECIPES_OLLAMA_EMBED_MODEL: z.string().default('nomic-embed-text'),

  RECIPES_ANTHROPIC_API_KEY: z.string().optional(),
  RECIPES_CLAUDE_MODEL: z.string().optional(),

  RECIPES_FEATURE_API_DOCS: flag(true),
  RECIPES_FEATURE_IMPORT_URL: flag(true),
  RECIPES_FEATURE_IMPORT_FILE: flag(true),
  RECIPES_FEATURE_EXPORT: flag(true),
  RECIPES_FEATURE_RAG: flag(false),
  RECIPES_FEATURE_CHAT: flag(false),
  RECIPES_FEATURE_SHARE: flag(false),
});

type Env = z.infer<typeof envSchema>;

/**
 * How the app authenticates users. OIDC wins whenever it is configured: the
 * fallback password is then ignored entirely, so a leftover
 * RECIPES_AUTH_PASSWORD cannot become a second way in.
 */
export type AuthConfig =
  | { mode: 'oidc'; issuerUrl: string; clientId: string; clientSecret: string }
  | { mode: 'password'; password: string }
  | { mode: 'unconfigured' };

export interface FeatureFlags {
  apiDocs: boolean;
  importUrl: boolean;
  importFile: boolean;
  export: boolean;
  rag: boolean;
  chat: boolean;
  share: boolean;
}

export interface Config {
  logLevel: Env['RECIPES_LOG_LEVEL'];
  api: { host: string; port: number };
  publicUrl: string;
  databaseUrl: string;
  redisUrl: string;
  auth: AuthConfig;
  sessionSecret: string | undefined;
  ollama: { url: string; embedModel: string };
  claude: { apiKey: string | undefined; model: string | undefined };
  features: FeatureFlags;
}

export class ConfigError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid configuration:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`);
    this.name = 'ConfigError';
    this.issues = issues;
  }
}

/**
 * Parse and validate configuration from an environment. Throws `ConfigError`
 * listing every problem at once, so a misconfigured deployment fails at
 * startup with the whole picture rather than one variable at a time.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(ownVariables(env));
  if (!parsed.success) {
    throw new ConfigError(
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  const e = parsed.data;
  const issues: string[] = [];

  const auth = resolveAuth(e, issues);

  if (e.RECIPES_FEATURE_CHAT) {
    if (!e.RECIPES_ANTHROPIC_API_KEY) {
      issues.push('RECIPES_ANTHROPIC_API_KEY: required when RECIPES_FEATURE_CHAT is on');
    }
    if (!e.RECIPES_CLAUDE_MODEL) {
      issues.push('RECIPES_CLAUDE_MODEL: required when RECIPES_FEATURE_CHAT is on');
    }
  }

  if (issues.length > 0) {
    throw new ConfigError(issues);
  }

  return {
    logLevel: e.RECIPES_LOG_LEVEL,
    api: { host: e.RECIPES_API_HOST, port: e.RECIPES_API_PORT },
    publicUrl: e.RECIPES_PUBLIC_URL,
    databaseUrl: e.RECIPES_DATABASE_URL,
    redisUrl: e.RECIPES_REDIS_URL,
    auth,
    sessionSecret: e.RECIPES_SESSION_SECRET,
    ollama: { url: e.RECIPES_OLLAMA_URL, embedModel: e.RECIPES_OLLAMA_EMBED_MODEL },
    claude: { apiKey: e.RECIPES_ANTHROPIC_API_KEY, model: e.RECIPES_CLAUDE_MODEL },
    features: {
      apiDocs: e.RECIPES_FEATURE_API_DOCS,
      importUrl: e.RECIPES_FEATURE_IMPORT_URL,
      importFile: e.RECIPES_FEATURE_IMPORT_FILE,
      export: e.RECIPES_FEATURE_EXPORT,
      rag: e.RECIPES_FEATURE_RAG,
      chat: e.RECIPES_FEATURE_CHAT,
      share: e.RECIPES_FEATURE_SHARE,
    },
  };
}

/**
 * Keep only this app's variables, and treat an empty value as unset. Compose
 * and `.env` files routinely produce `RECIPES_AUTH_PASSWORD=` for "not set",
 * and that must fall back to the default rather than fail validation.
 */
function ownVariables(env: NodeJS.ProcessEnv): Record<string, string> {
  const own: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('RECIPES_') && value !== undefined && value.trim() !== '') {
      own[key] = value.trim();
    }
  }
  return own;
}

function resolveAuth(e: Env, issues: string[]): AuthConfig {
  const oidcVars = {
    RECIPES_OIDC_ISSUER_URL: e.RECIPES_OIDC_ISSUER_URL,
    RECIPES_OIDC_CLIENT_ID: e.RECIPES_OIDC_CLIENT_ID,
    RECIPES_OIDC_CLIENT_SECRET: e.RECIPES_OIDC_CLIENT_SECRET,
  };
  const setCount = Object.values(oidcVars).filter((v) => v !== undefined).length;

  if (setCount > 0) {
    if (e.RECIPES_OIDC_ISSUER_URL && e.RECIPES_OIDC_CLIENT_ID && e.RECIPES_OIDC_CLIENT_SECRET) {
      return {
        mode: 'oidc',
        issuerUrl: e.RECIPES_OIDC_ISSUER_URL,
        clientId: e.RECIPES_OIDC_CLIENT_ID,
        clientSecret: e.RECIPES_OIDC_CLIENT_SECRET,
      };
    }
    for (const [name, value] of Object.entries(oidcVars)) {
      if (value === undefined) {
        issues.push(`${name}: required once any RECIPES_OIDC_* variable is set`);
      }
    }
    return { mode: 'unconfigured' };
  }

  if (e.RECIPES_AUTH_PASSWORD) {
    return { mode: 'password', password: e.RECIPES_AUTH_PASSWORD };
  }
  return { mode: 'unconfigured' };
}
