import { Request, Response } from "express";
import {
  getAllQuizzes,
  createNewQuiz,
  addQuestionsToQuiz,
  getQuestionsOfQuiz,
  findQuizById,
  scoreQuiz
} from "../services/quizService";


// GET /quizzes
// Fetches all quizzes.
export const listQuizzes = (req: Request, res: Response) => {
  const quizzes = getAllQuizzes();
  if (quizzes.length === 0) {  // No quizzes yet, tell the user to create one first
    return res.status(200).json({
      success: true,
      message: "No quizzes exist yet. Please create a quiz first.",
      quizzes: []
    });
  }

  res.status(200).json({
    success: true,
    quizzes: quizzes.map(q => ({ id: q.id, title: q.title }))
  });
};

// POST /quizzes
// Create a new quiz. Handles duplicate quiz titles gracefully.
export const createQuiz = (req: Request, res: Response) => {
  try {
    const quiz = createNewQuiz(req.body);
    res.status(201).json(quiz);
  } catch (err: any) {
    if (err.message === "QUIZ_EXISTS") {
      return res.status(400).json({
        success: false,
        error: "Quiz already exists",
        details: "A quiz with this title already exists"
      });
    }

    res.status(400).json({
      success: false,
      error: "Invalid payload",
      details: err.message
    });
  }
};

// POST /quizzes/:quizId/questions
// Adds questions to a specific quiz
export const addQuestions = (req: Request, res: Response) => {
  try {
    const quizId = Number(req.params.quizId);
    const questions = addQuestionsToQuiz(quizId, req.body.questions);
    res.status(201).json(questions);
  } catch (err: any) {
    const messages: Record<string, any> = {
      QUIZ_NOT_FOUND: [404, "Quiz not found", "Invalid quiz ID provided"],
      INVALID_QUESTIONS_ARRAY: [400, "Invalid request", "questions must be a non-empty array"]
    };

    const [status, error, details] = messages[err.message] || [400, "Invalid question payload", err.message];
    res.status(status).json({ success: false, error, details });
  }
};

// GET /quizzes/:quizId/questions
// Retrieve all questions for a specific quiz
export const getQuestionsForQuiz = (req: Request, res: Response) => {
  try {
    const quizId = Number(req.params.quizId);
    const questions = getQuestionsOfQuiz(quizId);

    if (questions.length === 0) { // No questions added to the quiz
      return res.status(200).json({
        success: true,
        message: "No questions have been added to this quiz yet.",
        questions: []
      });
    }

    res.status(200).json({
      success: true,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options.map(o => ({ id: o.id, text: o.text })),
      }))
    });
  } catch (err: any) {
    if (err.message === "QUIZ_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        details: "Invalid quiz ID provided"
      });
    }

    res.status(500).json({ success: false, error: err.message  });
  }
};


// POST /quizzes/:quizId/submit
// Submit answers and get a score
export const submitAnswers = (req: Request, res: Response) => {
  try {
    const quizId = Number(req.params.quizId);
    const quiz = findQuizById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        details: "Invalid quiz ID provided"
      });
    }

    const answers = req.body.answers;
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        details: "answers must be an array"
      });
    }

    const result = scoreQuiz(quiz, answers);

    // If no questions, return meaningful message
    if (result.total === 0) {
      return res.status(200).json({
        success: true,
        message: "No questions in this quiz to score",
        score: 0,
        total: 0
      });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};
