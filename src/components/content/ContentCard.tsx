import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Article } from '@/lib/data';
import ContentSummary from './ContentSummary';

type ContentCardProps = {
  article: Article;
};

export function ContentCard({ article }: ContentCardProps) {
  return (
    <Link href={`/content/${article.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{article.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {article.imageUrl && (
            <div className="aspect-video overflow-hidden rounded-md">
              <Image
                src={article.imageUrl}
                alt={article.title}
                width={600}
                height={400}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={article.imageHint}
              />
            </div>
          )}
          <ContentSummary content={article.content} />
        </CardContent>
      </Card>
    </Link>
  );
}
