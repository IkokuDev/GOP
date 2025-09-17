
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, getUserQuizHistory } from '@/services/userService';
import { getQuiz } from '@/services/quizService';
import { type UserProfile as UserProfileType, type QuizHistory as QuizHistoryType, type Quiz } from '@/lib/data';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

type EnrichedQuizHistory = QuizHistoryType & {
    quizTitle?: string;
}

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [quizHistory, setQuizHistory] = useState<EnrichedQuizHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchProfileData = async () => {
                setLoading(true);
                try {
                    const userProfile = await getUserProfile(user.uid);
                    setProfile(userProfile);
                    
                    const history = await getUserQuizHistory(user.uid);
                    
                    const enrichedHistoryPromises = history.map(async (h) => {
                        const quiz = await getQuiz(h.quizId);
                        return { ...h, quizTitle: quiz?.title };
                    });

                    const enrichedHistory = await Promise.all(enrichedHistoryPromises);

                    // Sort by date string descending
                    enrichedHistory.sort((a,b) => (b.date as string).localeCompare(a.date as string));

                    setQuizHistory(enrichedHistory);
                } catch (error) {
                    console.error("Error fetching profile data: ", error);
                } finally {
                    setLoading(false);
                }
            }
            fetchProfileData();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
             <div className="container py-8 md:py-12">
                <section className="flex flex-col items-center text-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-6 w-64" />
                </section>
                <Separator className="my-12" />
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-center font-headline">Quiz History</h2>
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </section>
            </div>
        )
    }

    if (!user || !profile) {
        return <div className="container py-12 text-center">Please log in to view your profile.</div>
    }

    return (
        <div className="container py-8 md:py-12">
        <section className="flex flex-col items-center text-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-4xl">{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl font-headline">
            {profile.name}
            </h1>
            <p className="text-lg text-muted-foreground">{profile.email}</p>
        </section>

        <Separator className="my-12" />

        <section>
            <h2 className="text-3xl font-bold mb-8 text-center font-headline">Quiz History</h2>
            <div className="max-w-2xl mx-auto space-y-6">
            {quizHistory.length > 0 ? quizHistory.map((history, index) => (
                <Card key={index} className="flex items-center p-4">
                    <div className="flex-shrink-0 mr-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                    <h3 className="font-bold">{history.quizTitle || 'Quiz'}</h3>
                    <p className="text-sm text-muted-foreground">
                        Completed on {new Date(history.date as any).toLocaleDateString()}
                    </p>
                    </div>
                    <div className="font-bold text-lg">
                    {history.score} / {history.totalQuestions}
                    </div>
                </Card>
                )) : <p className="text-center text-muted-foreground">You haven't completed any quizzes yet.</p>}
            </div>
        </section>
        </div>
    );
}
