import { describe, expect, it } from 'vitest';

import { ConfigError, loadConfig } from './index.ts';

function issuesFor(env: NodeJS.ProcessEnv): readonly string[] {
  try {
    loadConfig(env);
  } catch (error) {
    if (error instanceof ConfigError) return error.issues;
    throw error;
  }
  throw new Error('expected loadConfig to throw ConfigError');
}

describe('loadConfig', () => {
  it('starts with every optional feature off and core features on', () => {
    const config = loadConfig({});

    expect(config.api).toEqual({ host: '0.0.0.0', port: 3000 });
    expect(config.features).toEqual({
      apiDocs: true,
      importUrl: true,
      importFile: true,
      export: true,
      rag: false,
      chat: false,
      share: false,
    });
    expect(config.auth).toEqual({ mode: 'unconfigured' });
  });

  it('reads switches and settings from RECIPES_* variables', () => {
    const config = loadConfig({
      RECIPES_API_PORT: '8123',
      RECIPES_FEATURE_API_DOCS: 'false',
      RECIPES_FEATURE_RAG: 'on',
      RECIPES_OLLAMA_EMBED_MODEL: 'mxbai-embed-large',
    });

    expect(config.api.port).toBe(8123);
    expect(config.features.apiDocs).toBe(false);
    expect(config.features.rag).toBe(true);
    expect(config.ollama.embedModel).toBe('mxbai-embed-large');
  });

  it('treats an empty value as unset, so the default applies', () => {
    const config = loadConfig({ RECIPES_API_PORT: '', RECIPES_AUTH_PASSWORD: '   ' });

    expect(config.api.port).toBe(3000);
    expect(config.auth).toEqual({ mode: 'unconfigured' });
  });

  it('ignores variables without the RECIPES_ prefix', () => {
    const config = loadConfig({ PORT: '9999', FEATURE_CHAT: 'true' });

    expect(config.api.port).toBe(3000);
    expect(config.features.chat).toBe(false);
  });

  it('names the variable when a switch has an unreadable value', () => {
    expect(issuesFor({ RECIPES_FEATURE_SHARE: 'maybe' })).toEqual([
      expect.stringContaining('RECIPES_FEATURE_SHARE'),
    ]);
  });

  describe('auth', () => {
    it('uses the fallback password when OIDC is not configured', () => {
      expect(loadConfig({ RECIPES_AUTH_PASSWORD: 'family-dinner' }).auth).toEqual({
        mode: 'password',
        password: 'family-dinner',
      });
    });

    it('drops the fallback password entirely once OIDC is configured', () => {
      const config = loadConfig({
        RECIPES_AUTH_PASSWORD: 'family-dinner',
        RECIPES_OIDC_ISSUER_URL: 'https://id.example.com/application/o/recipes/',
        RECIPES_OIDC_CLIENT_ID: 'recipes',
        RECIPES_OIDC_CLIENT_SECRET: 'shh',
      });

      expect(config.auth).toEqual({
        mode: 'oidc',
        issuerUrl: 'https://id.example.com/application/o/recipes/',
        clientId: 'recipes',
        clientSecret: 'shh',
      });
      expect(JSON.stringify(config)).not.toContain('family-dinner');
    });

    it('rejects a half-configured OIDC setup instead of falling back to the password', () => {
      const issues = issuesFor({
        RECIPES_AUTH_PASSWORD: 'family-dinner',
        RECIPES_OIDC_ISSUER_URL: 'https://id.example.com/application/o/recipes/',
      });

      expect(issues).toEqual([
        expect.stringContaining('RECIPES_OIDC_CLIENT_ID'),
        expect.stringContaining('RECIPES_OIDC_CLIENT_SECRET'),
      ]);
    });
  });

  describe('chat', () => {
    it('requires an API key and a model before chat can be switched on', () => {
      expect(issuesFor({ RECIPES_FEATURE_CHAT: 'true' })).toEqual([
        expect.stringContaining('RECIPES_ANTHROPIC_API_KEY'),
        expect.stringContaining('RECIPES_CLAUDE_MODEL'),
      ]);
    });

    it('turns on when both are provided', () => {
      const config = loadConfig({
        RECIPES_FEATURE_CHAT: 'true',
        RECIPES_ANTHROPIC_API_KEY: 'sk-test',
        RECIPES_CLAUDE_MODEL: 'some-model',
      });

      expect(config.features.chat).toBe(true);
      expect(config.claude).toEqual({ apiKey: 'sk-test', model: 'some-model' });
    });
  });
});
