export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'text';
  options: Option[];
  correctAnswer?: string | undefined; // ✅ for text questions
}

export interface Quiz {
  id: number;
  title: string;
  questions: Question[];
}

// In-memory store
export const quizzes: Quiz[] = [];
export let quizIdCounter = 1;
export let questionIdCounter = 1;
export let optionIdCounter = 1;
