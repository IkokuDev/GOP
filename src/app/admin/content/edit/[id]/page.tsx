
import { notFound } from 'next/navigation';
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getArticle } from "@/services/articleService";

type EditPageProps = {
    params: {
        id: string;
    }
}

export default async function AdminEditContentPage({ params }: EditPageProps) {
    const article = await getArticle(params.id);

    if (!article) {
        notFound();
    }

    return (
        <div className="container py-8 md:py-12">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl font-headline mb-2">
                    Edit Article
                </h1>
                <p className="text-muted-foreground mb-8">Modify the article details and save your changes.</p>
                <ArticleForm article={article} />
            </div>
        </div>
    )
}
