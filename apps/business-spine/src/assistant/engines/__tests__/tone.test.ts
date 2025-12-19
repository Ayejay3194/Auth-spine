import { describe, it, expect } from "vitest";
import { scoreTone } from "../communication";

describe("scoreTone", () => {
  it("flags rushed text", () => {
    const s = scoreTone("Need this ASAP");
    expect(s.flags.length).toBeGreaterThan(0);
  });
  it("rewards politeness", () => {
    const s = scoreTone("Hi! Please confirm your appointment. Thank you.");
    expect(s.warmth).toBeGreaterThan(0.5);
  });
});
