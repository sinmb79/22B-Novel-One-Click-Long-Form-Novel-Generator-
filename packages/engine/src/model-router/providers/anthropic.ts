import type { ModelGenerationResult, ModelProvider, ModelTask } from "../types.js";

interface AnthropicContentItem {
  type?: string;
  text?: string;
}

interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
}

interface AnthropicResponsePayload {
  content?: AnthropicContentItem[];
  usage?: AnthropicUsage;
  error?: {
    message?: string;
  };
}

export interface AnthropicProviderOptions {
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

function getMaxTokens(task: ModelTask): number {
  switch (task) {
    case "plot":
      return 4096;
    case "prose":
      return 8192;
    case "qa":
      return 2048;
    default:
      return 4096;
  }
}

function extractText(payload: AnthropicResponsePayload): string {
  const parts = (payload.content ?? [])
    .map((item) => {
      if (item.type === "text") {
        return item.text?.trim() ?? "";
      }

      return "";
    })
    .filter((item) => item.length > 0);

  if (parts.length === 0) {
    throw new Error("Anthropic response did not include text content.");
  }

  return parts.join("\n\n");
}

export function createAnthropicProvider({
  apiKey,
  baseUrl,
  fetchImpl = fetch,
}: AnthropicProviderOptions): ModelProvider {
  const endpoint = `${normalizeBaseUrl(baseUrl, "https://api.anthropic.com/v1")}/messages`;

  return async ({ task, prompt, model }): Promise<ModelGenerationResult> => {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model,
        max_tokens: getMaxTokens(task),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const raw = await response.text();
    const payload = raw.length > 0 ? (JSON.parse(raw) as AnthropicResponsePayload) : {};

    if (!response.ok) {
      throw new Error(
        `Anthropic request failed (${response.status}): ${payload.error?.message ?? raw.slice(0, 240)}`,
      );
    }

    const text = extractText(payload);
    const tokensUsed =
      (payload.usage?.input_tokens ?? 0) + (payload.usage?.output_tokens ?? 0) || estimateTokens(text);

    return {
      text,
      tokensUsed,
    };
  };
}
