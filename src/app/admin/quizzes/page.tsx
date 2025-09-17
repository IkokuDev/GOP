
import { getQuizzes } from "@/services/quizService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQuizForm } from "@/components/admin/CreateQuizForm";
import { ManageQuizzes } from "@/components/admin/ManageQuizzes";
import { DisabledVideoGenerator } from "@/components/admin/DisabledVideoGenerator";

export default async function AdminQuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="container py-8 md:py-12">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl font-headline mb-2">
                Manage Quizzes
            </h1>
            <p className="text-muted-foreground">Create and manage quizzes for your readers.</p>
        </div>

        <Tabs defaultValue="create" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create Quiz</TabsTrigger>
                <TabsTrigger value="manage">Manage Quizzes</TabsTrigger>
                <TabsTrigger value="video">Video Generation</TabsTrigger>
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
  );
}

