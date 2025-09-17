
import Link from 'next/link';
import { getArticles } from '@/services/articleService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, FileText, Pencil } from 'lucide-react';

export default async function AdminContentPage() {
    const articles = await getArticles();

    return (
        <div className="container py-8 md:py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter md:text-5xl font-headline mb-2">
                        Manage Content
                    </h1>
                    <p className="text-muted-foreground">Create new articles for your readers.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/content/create">
                        <PlusCircle className="mr-2" />
                        New Article
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Existing Articles</CardTitle>
                    <CardDescription>A list of all articles in your database.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead className="hidden md:table-cell">Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.length > 0 ? (
                                articles.map(article => (
                                    <TableRow key={article.id}>
                                        <TableCell className="font-medium">{article.title}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {article.createdAt instanceof Date 
                                                ? article.createdAt.toLocaleDateString()
                                                : 'N/A'
                                            }
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                           <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/content/edit/${article.id}`}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <FileText className="h-8 w-8" />
                                            <p>No articles found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
