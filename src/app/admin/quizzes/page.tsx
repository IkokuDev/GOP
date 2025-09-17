
import { CreateQuizForm } from "@/components/admin/CreateQuizForm";

export default async function AdminQuizzesPage() {
  return (
    <div className="container py-8 md:py-12">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl font-headline mb-2">
                Manage Quizzes
            </h1>
            <p className="text-muted-foreground">Create and manage quizzes for your readers.</p>
        </div>

        <div className="max-w-4xl mx-auto">
            <CreateQuizForm />
        </div>
    </div>
  );
}
