import { createAnthropicProvider } from "./providers/anthropic.js";
import { createOpenAIProvider } from "./providers/openai.js";
import { createStubProvider } from "./providers/stub.js";
import { createModelRouter } from "./router.js";

import type { ModelProvider, ModelRouterConfig, ModelTask } from "./types.js";
import type { ModelRouter } from "./router.js";

export interface RuntimeModelRouterOptions {
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  providers?: Partial<Record<string, ModelProvider>>;
}

const TASKS: ModelTask[] = ["plot", "prose", "qa"];

const DEFAULT_MODELS: Record<string, Record<ModelTask, string>> = {
  anthropic: {
    plot: "claude-opus-4-6",
    prose: "claude-sonnet-4-6",
    qa: "claude-haiku-4-5",
  },
  openai: {
    plot: "gpt-5",
    prose: "gpt-5",
    qa: "gpt-5-mini",
  },
  stub: {
    plot: "stub-plot",
    prose: "stub-prose",
    qa: "stub-qa",
  },
};

function readEnvValue(
  env: Record<string, string | undefined>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = env[key];

    if (
      typeof value === "string" &&
      value.length > 0 &&
      value !== "undefined" &&
      value !== "null"
    ) {
      return value;
    }
  }

  return undefined;
}

function getDefaultModel(provider: string, task: ModelTask): string {
  return DEFAULT_MODELS[provider]?.[task] ?? `${provider}-${task}`;
}

function buildConfig(env: Record<string, string | undefined>): ModelRouterConfig {
  return {
    plot: buildRoute("plot", env),
    prose: buildRoute("prose", env),
    qa: buildRoute("qa", env),
  };
}

function buildRoute(task: ModelTask, env: Record<string, string | undefined>) {
  const suffix = task.toUpperCase();
  const provider =
    readEnvValue(
      env,
      `NOVEL_PROVIDER_${suffix}`,
      `NOVEL_MODEL_PROVIDER_${suffix}`,
      "NOVEL_PROVIDER",
      "NOVEL_MODEL_PROVIDER",
    ) ?? "stub";
  const model =
    readEnvValue(env, `NOVEL_MODEL_${suffix}`, "NOVEL_MODEL") ?? getDefaultModel(provider, task);

  return {
    provider,
    model,
  };
}

function buildBuiltInProviders(
  env: Record<string, string | undefined>,
  fetchImpl: typeof fetch | undefined,
): Record<string, ModelProvider> {
  const providers: Record<string, ModelProvider> = {
    stub: createStubProvider(),
  };

  const openAiApiKey = env.OPENAI_API_KEY;
  if (openAiApiKey) {
    providers.openai = createOpenAIProvider({
      apiKey: openAiApiKey,
      baseUrl: env.OPENAI_BASE_URL,
      fetchImpl,
    });
  }

  const anthropicApiKey = env.ANTHROPIC_API_KEY;
  if (anthropicApiKey) {
    providers.anthropic = createAnthropicProvider({
      apiKey: anthropicApiKey,
      baseUrl: env.ANTHROPIC_BASE_URL,
      fetchImpl,
    });
  }

  return providers;
}

function assertProviderAvailability(
  config: ModelRouterConfig,
  providers: Record<string, ModelProvider>,
): void {
  for (const task of TASKS) {
    const route = config[task];

    if (providers[route.provider]) {
      continue;
    }

    if (route.provider === "openai") {
      throw new Error('Provider "openai" is selected but OPENAI_API_KEY is not configured.');
    }

    if (route.provider === "anthropic") {
      throw new Error('Provider "anthropic" is selected but ANTHROPIC_API_KEY is not configured.');
    }

    throw new Error(`Provider "${route.provider}" is not registered.`);
  }
}

export function createRuntimeModelRouter({
  env = process.env,
  fetchImpl,
  providers: overrides,
}: RuntimeModelRouterOptions = {}): ModelRouter {
  const config = buildConfig(env);
  const providers = buildBuiltInProviders(env, fetchImpl);

  for (const [name, provider] of Object.entries(overrides ?? {})) {
    if (provider) {
      providers[name] = provider;
    }
  }

  assertProviderAvailability(config, providers);

  return createModelRouter(config, providers);
}
