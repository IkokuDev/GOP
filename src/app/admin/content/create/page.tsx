
import { ArticleForm } from "@/components/admin/ArticleForm";

export default function AdminCreateContentPage() {
    return (
        <div className="container py-8 md:py-12">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl font-headline mb-2">
                    Create New Article
                </h1>
                <p className="text-muted-foreground mb-8">Fill in the details below to publish a new article.</p>
                <ArticleForm />
            </div>
        </div>
    )
}
