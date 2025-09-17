
import { getQuiz } from "@/services/quizService";
import { notFound } from 'next/navigation';
import { CreateQuizForm } from "@/components/admin/CreateQuizForm";

type EditPageProps = {
    params: {
        id: string;
    }
}

export default async function AdminEditQuizPage({ params }: EditPageProps) {
    const quiz = await getQuiz(params.id);

    if (!quiz) {
        notFound();
    }

    // The form component expects a serializable quiz, so we just pass the fetched one
    return (
        <div className="container py-8 md:py-12">
            <div className="mx-auto max-w-4xl">
                 <h1 className="text-4xl font-bold tracking-tighter md:text-5xl font-headline mb-2 text-center">
                    Edit Quiz
                </h1>
                <p className="text-muted-foreground mb-8 text-center">Modify the quiz details and save your changes.</p>
                <CreateQuizForm quiz={quiz} />
            </div>
        </div>
    )
}
