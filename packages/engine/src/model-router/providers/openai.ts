import type { ModelGenerationResult, ModelProvider, ModelTask } from "../types.js";

interface OpenAIUsage {
  total_tokens?: number;
}

interface OpenAIOutputContentItem {
  type?: string;
  text?: string;
}

interface OpenAIOutputItem {
  content?: OpenAIOutputContentItem[];
}

interface OpenAIResponsePayload {
  output_text?: string;
  output?: OpenAIOutputItem[];
  usage?: OpenAIUsage;
  error?: {
    message?: string;
  };
}

export interface OpenAIProviderOptions {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

function normalizeBaseUrl(baseUrl: string | undefined, fallback: string): string {
  return (baseUrl ?? fallback).replace(/\/+$/, "");
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function extractOutputText(payload: OpenAIResponsePayload): string {
  const direct = payload.output_text?.trim();

  if (direct) {
    return direct;
  }

  const nested = (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((item) => {
      if (item.type === "output_text" || item.type === "text") {
        return item.text?.trim() ?? "";
      }

      return "";
    })
    .filter((item) => item.length > 0);

  if (nested.length === 0) {
    throw new Error("OpenAI response did not include text output.");
  }

  return nested.join("\n\n");
}

function buildRequestBody(task: ModelTask, model: string, prompt: string) {
  return {
    model,
    input: prompt,
    text: {
      verbosity: task === "prose" ? "high" : "medium",
    },
  };
}

export function createOpenAIProvider({
  apiKey,
  baseUrl,
  fetchImpl = fetch,
}: OpenAIProviderOptions): ModelProvider {
  const endpoint = `${normalizeBaseUrl(baseUrl, "https://api.openai.com/v1")}/responses`;

  return async ({ task, prompt, model }): Promise<ModelGenerationResult> => {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildRequestBody(task, model, prompt)),
    });

    const raw = await response.text();
    const payload = raw.length > 0 ? (JSON.parse(raw) as OpenAIResponsePayload) : {};

    if (!response.ok) {
      throw new Error(
        `OpenAI request failed (${response.status}): ${payload.error?.message ?? raw.slice(0, 240)}`,
      );
    }

    const text = extractOutputText(payload);

    return {
      text,
      tokensUsed: payload.usage?.total_tokens ?? estimateTokens(text),
    };
  };
}
