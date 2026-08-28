import { describe, expect, it } from "vitest";
import { formatCountdown, clamp, pad2 } from "@/lib/utils";
import { applySm2 } from "@/components/flashcard-deck";
import type { Flashcard } from "@/lib/types";

describe("formatCountdown", () => {
  it("formats milliseconds as HH:MM:SS", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(61000)).toBe("00:01:01");
    expect(formatCountdown(3661000)).toBe("01:01:01");
  });
});

describe("clamp / pad2", () => {
  it("clamps within range", () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
  });
  it("pads single digits", () => {
    expect(pad2(3)).toBe("03");
    expect(pad2(12)).toBe("12");
  });
});

describe("applySm2", () => {
  const base: Flashcard = {
    id: "f1",
    front: "Q",
    back: "A",
    easeFactor: 2.5,
    intervalDays: 1,
    dueAt: new Date().toISOString(),
    correctStreak: 0,
    aiGenerated: false
  };

  it("resets interval on AGAIN", () => {
    const updated = applySm2({ ...base, intervalDays: 10, correctStreak: 4 }, "AGAIN");
    expect(updated.intervalDays).toBe(1);
    expect(updated.correctStreak).toBe(0);
  });

  it("grows interval on GOOD/EASY", () => {
    const updated = applySm2(base, "GOOD");
    expect(updated.correctStreak).toBe(1);
    expect(updated.intervalDays).toBeGreaterThanOrEqual(1);
  });
});
