function round(value: number): number {
  return Number(value.toFixed(6));
}

export function chunkReferenceText(text: string, chunkSize = 500): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];

  for (let cursor = 0; cursor < normalized.length; cursor += chunkSize) {
    chunks.push(normalized.slice(cursor, cursor + chunkSize));
  }

  return chunks;
}

export function createLightweightEmbedding(text: string): number[] {
  const vector = new Array<number>(16).fill(0);

  for (let index = 0; index < text.length; index += 1) {
    const codePoint = text.charCodeAt(index);
    vector[index % vector.length] += codePoint / 255;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;

  return vector.map((value) => round(value / magnitude));
}
