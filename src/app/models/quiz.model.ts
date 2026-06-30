//app-quiz/models/quiz.model.ts
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string[];
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}