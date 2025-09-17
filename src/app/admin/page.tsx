import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { BookText, ListChecks } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="container py-8 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tighter md:text-6xl font-headline">
          Admin Dashboard
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Manage cultural content and quizzes.
        </p>
      </section>

      <section className="grid gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
        <Link href="/admin/content" className="group">
          <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center gap-4">
              <BookText className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Create, edit, and delete articles.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/quizzes" className="group">
          <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center gap-4">
              <ListChecks className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Quiz Management</CardTitle>
                <CardDescription>Create and manage quizzes.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </section>
    </div>
  );
}
