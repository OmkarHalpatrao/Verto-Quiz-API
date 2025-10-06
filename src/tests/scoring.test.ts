import { resetQuizzes } from "../services/quizService";
import {
  createNewQuiz,
  addQuestionsToQuiz,
  scoreQuiz,
} from "../services/quizService";

describe("Quiz Scoring Tests", () => {
  beforeEach(() => {
    // Reset in-memory store before each test
    resetQuizzes();
  });

  test("Single choice, multiple choice, and text question scoring", () => {
    // 1. Create a new quiz
    const quiz = createNewQuiz({ title: "General Knowledge" });

    // 2. Add single-choice question
    const singleChoice = addQuestionsToQuiz(quiz.quizId, [
      {
        text: "Capital of India?",
        type: "single_choice",
        options: [
          { text: "New Delhi", isCorrect: true },
          { text: "Mumbai", isCorrect: false },
        ],
      },
    ]);

    // 3. Add multiple-choice question
    const multipleChoice = addQuestionsToQuiz(quiz.quizId, [
      {
        text: "Select prime numbers",
        type: "multiple_choice",
        options: [
          { text: "2", isCorrect: true },
          { text: "3", isCorrect: true },
          { text: "4", isCorrect: false },
          { text: "5", isCorrect: true },
        ],
      },
    ]);

    // 4. Add text question
    const textQuestion = addQuestionsToQuiz(quiz.quizId, [
      {
        text: "Largest planet?",
        type: "text",
        correctAnswer: "jupiter",
        options: [],
      },
    ]);

    if (!singleChoice[0] || !multipleChoice[0] || !textQuestion[0]) {
      throw new Error("Test questions not initialized properly");
    }

    // 5. Prepare answers
    const answers = [
      { questionId: singleChoice[0].questionId, selectedOptionIds: [1] }, // correct
      { questionId: multipleChoice[0].questionId, selectedOptionIds: [1, 2, 4] }, // correct
      {
        questionId: textQuestion[0].questionId,
        textAnswer: "The largest planet is Jupiter",
      }, // correct fuzzy match
    ];

    // 6. Score quiz
    const result = scoreQuiz(quiz, answers);

    // 7. Assertions
    expect(result.total).toBe(3);
    expect(result.score).toBe(3);

    // 8. Test partial/fuzzy matching
    const fuzzyAnswers = [
      { questionId: textQuestion[0].questionId, textAnswer: "jupitr" },
    ];
    const fuzzyResult = scoreQuiz(quiz, fuzzyAnswers);
    expect(fuzzyResult.score).toBe(1);
  });

  test("Incorrect answers should score zero", () => {
    const quiz = createNewQuiz({ title: "Science Quiz" });

    // Add single-choice question
    const singleChoice = addQuestionsToQuiz(quiz.quizId, [
      {
        text: "Capital of France?",
        type: "single_choice",
        options: [
          { text: "Paris", isCorrect: true },
          { text: "London", isCorrect: false },
        ],
      },
    ]);

    // Add multiple-choice question
    const multipleChoice = addQuestionsToQuiz(quiz.quizId, [
      {
        text: "Select even numbers",
        type: "multiple_choice",
        options: [
          { text: "1", isCorrect: false },
          { text: "2", isCorrect: true },
          { text: "3", isCorrect: false },
          { text: "4", isCorrect: true },
        ],
      },
    ]);

    // Add text question
    const textQuestion = addQuestionsToQuiz(quiz.quizId, [
      {
        text: "Largest planet?",
        type: "text",
        correctAnswer: "jupiter",
        options: [],
      },
    ]);

    if (!singleChoice[0] || !multipleChoice[0] || !textQuestion[0]) {
      throw new Error("Test questions not initialized properly");
    }

    const answers = [
      { questionId: singleChoice[0].questionId, selectedOptionIds: [2] },
      { questionId: multipleChoice[0].questionId, selectedOptionIds: [1, 3] },
      { questionId: textQuestion[0].questionId, textAnswer: "Saturn" },
    ];

    const result = scoreQuiz(quiz, answers);
    expect(result.score).toBe(0);
    expect(result.total).toBe(3);
  });
});
