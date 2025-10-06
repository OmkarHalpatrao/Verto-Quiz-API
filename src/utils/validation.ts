import { z } from "zod";

const createQuizSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
});

const optionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean().optional(),
});

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["single_choice", "multiple_choice", "text"]),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().optional(), // ✅ optional for text
});

export function validateCreateQuiz(data: any) {
  return createQuizSchema.parse(data);
}

export function validateQuestionPayload(data: any) {
  const parsed = questionSchema.parse(data);

  if (parsed.type === "text") {
    if (parsed.text.length > 300) {
      throw new Error("Text-based question must be <= 300 characters");
    }
    if (!parsed.correctAnswer || parsed.correctAnswer.trim().length === 0) {
      throw new Error("Text question must have a valid Answer");
    }
  }

  if (parsed.type === "single_choice") {
    if (!parsed.options || parsed.options.length < 2) {
      throw new Error("Single-choice question must have at least 2 options");
    }
    const correctCount = parsed.options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error("Single-choice must have exactly one correct option");
    }
  }

  if (parsed.type === "multiple_choice") {
    if (!parsed.options || parsed.options.length < 2) {
      throw new Error("Multiple-choice question must have at least 2 options");
    }
    const correctCount = parsed.options.filter(o => o.isCorrect).length;
    if (correctCount < 1) {
      throw new Error("Multiple-choice must have at least one correct option");
    }
  }

  return parsed;
}
