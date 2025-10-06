import { Quiz, Question } from "../model";
import { validateCreateQuiz, validateQuestionPayload } from "../utils/validation";
import { Searcher } from "fast-fuzzy";

// --- In-memory store ---
// This is our temporary database. All quizzes live here.
const quizzes: Quiz[] = [];
let quizIdCounter = 1;

// Resets the quiz store — useful for testing or restarting the app
export const resetQuizzes = () => {
  quizzes.length = 0;
  quizIdCounter = 1;
};

// Returns all quizzes
export const getAllQuizzes = () => quizzes;

// Creates a new quiz
export const createNewQuiz = (data: any): Quiz => {
  // Validate incoming data to ensure it has a proper title
  const parsed = validateCreateQuiz(data);

  // Check if a quiz with the same title already exists
  const existingQuiz = quizzes.find(q => q.title.toLowerCase() === parsed.title.toLowerCase());
  if (existingQuiz) throw new Error("QUIZ_EXISTS");

  // Create a new quiz object
  const quiz: Quiz = {
    id: quizIdCounter++, // auto-increment ID
    title: parsed.title,
    questions: [], // initially empty
  };

  quizzes.push(quiz);
  return quiz;
};

// Find a quiz by its ID
export const findQuizById = (id: number) => quizzes.find(q => q.id === id);

// Add questions to a specific quiz
export const addQuestionsToQuiz = (quizId: number, questionsPayload: any[]): Question[] => {
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) throw new Error("QUIZ_NOT_FOUND"); // if quiz doesn't exist

  if (!Array.isArray(questionsPayload) || questionsPayload.length === 0) {
    throw new Error("INVALID_QUESTIONS_ARRAY"); // must provide a non-empty array
  }

  // Validate each question
  const validatedQuestions = questionsPayload.map(q => validateQuestionPayload(q));

  // Start IDs for questions in this quiz
  const startId = quiz.questions.length + 1;

  const addedQuestions = validatedQuestions.map((q, idx) => {
    // Map options with proper IDs and mark correct ones
    const options = (q.options || []).map((o, i) => ({
      id: i + 1,
      text: o.text,
      isCorrect: !!o.isCorrect, // ensure boolean
    }));

    const question: Question = {
      id: startId + idx,
      text: q.text,
      type: q.type,
      options,
      correctAnswer: q.correctAnswer, // only relevant for text questions
    };

    // Add the question to the quiz
    quiz.questions.push(question);
    return question;
  });

  return addedQuestions;
};

// Get all questions for a specific quiz
export const getQuestionsOfQuiz = (quizId: number) => {
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) throw new Error("QUIZ_NOT_FOUND");
  return quiz.questions;
};

// Score a quiz given a set of answers
export const scoreQuiz = (quiz: Quiz, answers: any[]) => {
  let score = 0;
  const total = quiz.questions.length;

  if (total === 0) {
    // No questions to score
    return { score: 0, total: 0, message: "No questions in this quiz" };
  }

  for (const ans of answers) {
    const q = quiz.questions.find(x => x.id === ans.questionId);
    if (!q) continue; // skip if question not found

    if (q.type === "text") {
      // For text questions, check for exact match or fuzzy match
      const userAnswer = (ans.textAnswer || "").trim().toLowerCase();
      const correctAnswer = (q.correctAnswer || "").trim().toLowerCase();

      if (!correctAnswer) continue; // skip if no correct answer

      if (userAnswer.includes(correctAnswer)) {
        score += 1;
        continue;
      }

      // Use fuzzy search if exact match fails
      const searcher = new Searcher([correctAnswer], { threshold: 0.7 });
      const result = searcher.search(userAnswer);

      if (result.length > 0) score += 1;
    } 
    else if (q.type === "single_choice") {
      // Single choice: take first selected option and check if it's correct
      const selected = Array.isArray(ans.selectedOptionIds)
        ? ans.selectedOptionIds[0]
        : ans.selectedOptionIds;
      if (q.options.find(o => o.isCorrect && o.id === selected)) score += 1;
    } 
    else if (q.type === "multiple_choice") {
      // Multiple choice: compare selected IDs with correct IDs
      const selected = (
        Array.isArray(ans.selectedOptionIds)
          ? ans.selectedOptionIds
          : [ans.selectedOptionIds]
      ).filter(Boolean).map(Number).sort();

      const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id).sort();
      if (JSON.stringify(correctIds) === JSON.stringify(selected)) score += 1;
    }
  }

  return { score, total }; // return final score
};
