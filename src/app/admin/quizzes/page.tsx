
import { getQuizzes } from "@/services/quizService";
import { CreateQuizForm } from "@/components/admin/CreateQuizForm";
import { ManageQuizzes } from "@/components/admin/ManageQuizzes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisabledVideoGenerator } from "@/components/admin/DisabledVideoGenerator";

export default async function AdminQuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="container py-8 md:py-12">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl font-headline mb-2">
                Manage Quizzes
            </h1>
            <p className="text-muted-foreground">Create, manage, and generate content for your quizzes.</p>
        </div>

        <div className="max-w-4xl mx-auto">
             <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="create">Create Quiz</TabsTrigger>
                    <TabsTrigger value="manage">Manage Quizzes</TabsTrigger>
                    <TabsTrigger value="video">AI Video</TabsTrigger>
                </TabsList>
                <TabsContent value="create" className="mt-6">
                    <CreateQuizForm />
                </TabsContent>
                <TabsContent value="manage" className="mt-6">
                    <ManageQuizzes quizzes={quizzes} />
                </TabsContent>
                <TabsContent value="video" className="mt-6">
                    <DisabledVideoGenerator />
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
