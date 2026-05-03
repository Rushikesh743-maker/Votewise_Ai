import { z } from "zod";

// Mirrors the input validation used in Learn.tsx
export const messageSchema = z.string().trim().min(1, "Type a message").max(2000);

// Pure scoring helper — used for unit tests and as a guideline.
// Server is the source of truth; this gives instant local feedback.
export interface AnswerKey {
  questionId: string;
  correctIndex: number;
}
export interface UserAnswer {
  questionId: string;
  selectedIndex: number;
}

export const calculateScore = (key: AnswerKey[], answers: UserAnswer[]) => {
  const map = new Map(key.map((k) => [k.questionId, k.correctIndex]));
  let correct = 0;
  for (const a of answers) {
    if (map.get(a.questionId) === a.selectedIndex) correct += 1;
  }
  return { correct, total: key.length, percent: Math.round((correct / key.length) * 100) };
};
