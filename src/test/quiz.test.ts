import { describe, expect, it } from "vitest";
import { calculateScore, messageSchema } from "@/lib/quiz";

describe("messageSchema (chat input validation)", () => {
  it("rejects empty input", () => {
    expect(messageSchema.safeParse("   ").success).toBe(false);
  });
  it("accepts a normal question", () => {
    expect(messageSchema.safeParse("How do I register?").success).toBe(true);
  });
  it("rejects messages over 2000 characters", () => {
    expect(messageSchema.safeParse("a".repeat(2001)).success).toBe(false);
  });
});

describe("calculateScore (quiz scoring)", () => {
  const key = [
    { questionId: "q1", correctIndex: 0 },
    { questionId: "q2", correctIndex: 2 },
    { questionId: "q3", correctIndex: 1 },
  ];

  it("scores all-correct answers as 100%", () => {
    const r = calculateScore(key, [
      { questionId: "q1", selectedIndex: 0 },
      { questionId: "q2", selectedIndex: 2 },
      { questionId: "q3", selectedIndex: 1 },
    ]);
    expect(r).toEqual({ correct: 3, total: 3, percent: 100 });
  });

  it("scores partial answers correctly", () => {
    const r = calculateScore(key, [
      { questionId: "q1", selectedIndex: 0 },
      { questionId: "q2", selectedIndex: 0 },
      { questionId: "q3", selectedIndex: 1 },
    ]);
    expect(r.correct).toBe(2);
    expect(r.percent).toBe(67);
  });

  it("scores all-wrong as 0%", () => {
    const r = calculateScore(key, [
      { questionId: "q1", selectedIndex: 1 },
      { questionId: "q2", selectedIndex: 1 },
      { questionId: "q3", selectedIndex: 0 },
    ]);
    expect(r.correct).toBe(0);
    expect(r.percent).toBe(0);
  });
});
