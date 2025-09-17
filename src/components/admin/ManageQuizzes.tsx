
import Link from 'next/link';
import { type Quiz } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListChecks } from 'lucide-react';

type ManageQuizzesProps = {
    quizzes: Quiz[];
}

export function ManageQuizzes({ quizzes }: ManageQuizzesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Existing Quizzes</CardTitle>
                <CardDescription>A list of all quizzes in your database.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="hidden md:table-cell">Questions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quizzes.length > 0 ? (
                            quizzes.map(quiz => (
                                <TableRow key={quiz.id}>
                                    <TableCell className="font-medium">{quiz.title}</TableCell>
                                    <TableCell className="hidden md:table-cell">{quiz.questions.length}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">
                                     <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <ListChecks className="h-8 w-8" />
                                        <p>No quizzes found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
