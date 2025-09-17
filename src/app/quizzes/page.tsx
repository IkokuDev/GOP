import { getQuizzes } from '@/services/quizService';
import Link from 'next/link';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="container py-8 md:py-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter md:text-6xl font-headline">
          Cultural Quizzes
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          How much do you know about Nigerian culture? Put your knowledge to the test!
        </p>
      </section>

      <section className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href={`/quizzes/${quiz.id}`}>Start Quiz</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
