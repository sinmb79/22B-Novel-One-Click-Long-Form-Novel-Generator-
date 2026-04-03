import type { ModelProvider } from "../types.js";

export function createStubProvider(): ModelProvider {
  return async ({ task, prompt, model }) => {
    return {
      text: `Generated(${task}) [${model}] ${prompt.slice(0, 240)}`,
      tokensUsed: Math.max(64, Math.ceil(prompt.length / 4)),
    };
  };
}
