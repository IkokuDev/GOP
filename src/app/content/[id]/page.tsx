import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArticle } from '@/services/articleService';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type ContentPageProps = {
  params: {
    id: string;
  };
};

export default async function ContentPage({ params }: ContentPageProps) {
  const article = await getArticle(params.id);
  
  if (!article) {
    notFound();
  }

  return (
    <article className="container max-w-4xl py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl font-headline">
          {article.title}
        </h1>
      </div>

      {article.imageUrl && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
            data-ai-hint={article.imageHint}
          />
        </div>
      )}

      <div className="space-y-6 text-lg text-foreground/90">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {article.quizId && (
        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="group">
            <Link href={`/quizzes/${article.quizId}`}>
              Test Your Knowledge
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      )}
    </article>
  );
}
