

import { QuizView, type SerializableQuiz } from "@/components/quiz/QuizView";
import { getQuiz } from "@/services/quizService";
import { notFound } from 'next/navigation';

type QuizPageProps = {
  params: {
    id: string;
  };
};

export default async function QuizPage({ params }: QuizPageProps) {
  const quizData = await getQuiz(params.id);

  if (!quizData) {
    notFound();
  }
  
  // Convert Date to a serializable format (ISO string) before passing to client component
  const serializableQuiz: SerializableQuiz = {
    ...quizData,
    createdAt: quizData.createdAt.toISOString(),
    questions: quizData.questions.map(q => ({...q}))
  };

  return <QuizView quiz={serializableQuiz} />;
}
