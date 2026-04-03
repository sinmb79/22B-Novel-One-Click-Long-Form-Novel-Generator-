export type ModelTask = "plot" | "prose" | "qa";

export interface ModelRoute {
  provider: string;
  model: string;
}

export interface ModelRouterConfig {
  plot: ModelRoute;
  prose: ModelRoute;
  qa: ModelRoute;
}

export interface ModelGenerationRequest {
  task: ModelTask;
  prompt: string;
}

export interface ModelGenerationResult {
  text: string;
  tokensUsed: number;
}

export type ModelProvider = (request: {
  task: ModelTask;
  prompt: string;
  model: string;
}) => Promise<ModelGenerationResult> | ModelGenerationResult;
