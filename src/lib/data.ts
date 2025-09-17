
import { z } from 'zod';

export type Article = {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  quizId?: string;
  createdAt: Date;
  userId: string;
};

export const CreateArticleInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().url(),
  imageHint: z.string(),
  userId: z.string(),
});

export type CreateArticleInput = z.infer<typeof CreateArticleInputSchema>;


export type Question = {
  id: string;
  text: string;
  options?: string[]; // Optional for short-answer
  correctAnswer: string | string[]; // Can be a single string or an array for short-answer
  type: 'multiple-choice' | 'true-false' | 'short-answer';
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  articleId?: string;
  questions: Question[];
  createdAt: Date;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  avatar: string;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  score: number;
}

export type QuizHistory = {
  quizId: string;
  score: number;
  totalQuestions: number;
  date: string;
}
