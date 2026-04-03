import type {
  ModelGenerationRequest,
  ModelGenerationResult,
  ModelProvider,
  ModelRouterConfig,
} from "./types.js";

export interface ModelRouter {
  generate(request: ModelGenerationRequest): Promise<ModelGenerationResult>;
}

export function createModelRouter(
  config: ModelRouterConfig,
  providers: Record<string, ModelProvider>,
): ModelRouter {
  return {
    async generate(request) {
      const route = config[request.task];
      const provider = providers[route.provider];

      if (!provider) {
        throw new Error(`Provider "${route.provider}" is not registered`);
      }

      return provider({
        task: request.task,
        prompt: request.prompt,
        model: route.model,
      });
    },
  };
}
