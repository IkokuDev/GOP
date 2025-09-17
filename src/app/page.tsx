import { getArticles } from '@/services/articleService';
import { ContentCard } from '@/components/content/ContentCard';

export default async function Home() {
  const allArticles = await getArticles();

  return (
    <div className="container py-8 md:py-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter md:text-6xl font-headline">
          Discover Nigerian Culture
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Explore a rich tapestry of stories, traditions, and art. Test your knowledge with our cultural quizzes.
        </p>
      </section>

      <section className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {allArticles.map((article) => (
          <ContentCard key={article.id} article={article} />
        ))}
      </section>
    </div>
  );
}
