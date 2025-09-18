
"use client";

import { useState, useEffect } from 'react';
import { type Question, type Quiz } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, Award, ChevronsRight, RotateCw, Loader2 } from 'lucide-react';
import { Progress } from '../ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { recordQuizResult } from '@/services/quizService';
import { getUserQuizHistory } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export type SerializableQuiz = Omit<Quiz, 'createdAt'> & {
  createdAt: string;
};

type QuizViewProps = {
  quiz: SerializableQuiz;
};

export function QuizView({ quiz }: QuizViewProps) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasAttempted, setHasAttempted] = useState<boolean | undefined>(undefined);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHistory = async () => {
        if (user) {
            setLoading(true);
            try {
                const history = await getUserQuizHistory(user.uid);
                const existingResult = history.find(h => h.quizId === quiz.id);
                if (existingResult) {
                    setScore(existingResult.score);
                    setIsFinished(true);
                    setHasAttempted(true);
                } else {
                    setHasAttempted(false);
                }
            } catch (error) {
                console.error("Failed to check quiz history:", error);
                setHasAttempted(false); // Assume not attempted if history check fails
            } finally {
                setLoading(false);
            }
        } else {
            setHasAttempted(false);
            setLoading(false);
        }
    };

    if (!authLoading) {
       checkHistory();
    }
  }, [user, authLoading, quiz.id]);


  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    let isCorrect = false;
    if (currentQuestion.type === 'short-answer') {
        const correctAnswers = Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer : [currentQuestion.correctAnswer];
        isCorrect = correctAnswers.some(correct => answer.trim().toLowerCase() === correct.trim().toLowerCase());
    } else {
        isCorrect = answer === currentQuestion.correctAnswer;
    }

    if (isCorrect) {
      setScore(score + 1);
    }
  };
  
  const handleNext = async () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
      if (user && !hasAttempted) {
        try {
          await recordQuizResult(user.uid, quiz.id, score + (isAnswered ? 0 : 1), quiz.questions.length);
          toast({ title: "Quiz result saved!" });
          setHasAttempted(true); // Mark as attempted after saving
        } catch (error) {
          toast({ variant: "destructive", title: "Failed to save quiz result." });
        }
      }
    }
  };

  const handleRestart = () => {
    // This button is disabled if already attempted, but as a safeguard:
    if (hasAttempted) {
        toast({
            title: "Already Attempted",
            description: "You can only take each quiz once."
        });
        return;
    }
    // Logic to restart if it were allowed
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
    setIsAnswered(false);
    setSelectedAnswer(null);
  }

  if (loading || authLoading || hasAttempted === undefined) {
      return (
        <div className="container flex items-center justify-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )
  }

  if (isFinished) {
    const finalScorePercent = (score / quiz.questions.length) * 100;
    return (
      <div className="container flex items-center justify-center py-12">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <Award className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-headline">Quiz Complete!</CardTitle>
            <CardDescription>You've completed the {quiz.title}.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl">Your Score:</p>
            <p className="text-6xl font-bold text-primary my-2">{finalScorePercent.toFixed(0)}%</p>
            <p className="text-muted-foreground">{score} out of {quiz.questions.length} correct</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRestart} className="w-full" disabled={hasAttempted}>
              <RotateCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const renderAnswerOptions = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
      case 'ai-video':
        return question.options!.map((option) => {
          const isCorrect = option === question.correctAnswer;
          const isSelected = option === selectedAnswer;
          return (
            <Button
              key={option}
              variant="outline"
              size="lg"
              className={cn(
                "justify-start h-auto py-3 text-left whitespace-normal",
                isAnswered && isCorrect && "border-primary text-primary bg-primary/10 hover:bg-primary/20",
                isAnswered && isSelected && !isCorrect && "border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20"
              )}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
            >
              <div className="flex-shrink-0 w-5 mr-2">
                {isAnswered && (isCorrect ? <Check className="h-5 w-5" /> : isSelected ? <X className="h-5 w-f" /> : null)}
              </div>
              {option}
            </Button>
          );
        });

      case 'true-false':
        return (
          <RadioGroup 
            onValueChange={(value) => handleAnswer(value)} 
            value={selectedAnswer || ""}
            disabled={isAnswered}
            className="gap-4"
            >
            {question.options!.map(option => {
               const isCorrect = option === question.correctAnswer;
               const isSelected = option === selectedAnswer;
               return (
                <Label key={option} className={cn(
                  "flex items-center gap-3 rounded-md border-2 p-4 cursor-pointer transition-colors",
                  isAnswered && isCorrect && "border-primary text-primary bg-primary/10",
                  isAnswered && isSelected && !isCorrect && "border-destructive text-destructive bg-destructive/10",
                  !isAnswered && "border-input hover:bg-accent hover:text-accent-foreground",
                  isSelected && !isAnswered && "border-primary",
                )}>
                  <RadioGroupItem value={option} id={option} className="h-5 w-5" />
                  <span className="text-lg font-medium">{option}</span>
                   <div className="ml-auto flex-shrink-0 w-5">
                    {isAnswered && (isCorrect ? <Check className="h-5 w-5 text-primary" /> : isSelected ? <X className="h-5 w-5 text-destructive" /> : null)}
                  </div>
                </Label>
               )
            })}
          </RadioGroup>
        );

      case 'short-answer':
        const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
        const isCorrect = selectedAnswer && correctAnswers.some(correct => selectedAnswer.trim().toLowerCase() === correct.trim().toLowerCase());
        return (
          <div className="space-y-4">
             <Input 
                placeholder="Type your answer here..."
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={isAnswered}
                className="text-lg"
             />
             <Button onClick={() => handleAnswer(selectedAnswer || "")} disabled={isAnswered || !selectedAnswer}>Submit Answer</Button>
             {isAnswered && (
                <div className={cn("p-4 rounded-md", isCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                    <p>Correct Answer{correctAnswers.length > 1 ? 's' : ''}: <strong>{correctAnswers.join(' / ')}</strong></p>
                </div>
             )}
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-2xl font-headline">{quiz.title}</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentQuestion.type === 'ai-video' && currentQuestion.videoUrl && (
            <div className="w-full aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center mb-6">
                <video key={currentQuestion.videoUrl} src={currentQuestion.videoUrl} controls className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-xl mb-6">{currentQuestion.text}</p>
          <div className="grid grid-cols-1 gap-4">
            {renderAnswerOptions(currentQuestion)}
          </div>
        </CardContent>
        {isAnswered && (
          <CardFooter>
            <Button onClick={handleNext} className="w-full group">
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <ChevronsRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
