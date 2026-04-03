import { describe, expect, it } from "vitest";

describe("engine workspace", () => {
  it("loads the engine entrypoint", async () => {
    const module = await import("./index.js");
    expect(module).toBeDefined();
  });
});
