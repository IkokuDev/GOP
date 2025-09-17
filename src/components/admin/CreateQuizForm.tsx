
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, X, Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createQuiz, updateQuiz } from "@/services/quizService";
import { type Question, type Quiz } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type QuestionWithLocalId = Question & { localId: number };
type QuizWithLocalQuestionIds = Omit<Quiz, 'questions'> & {
    questions: QuestionWithLocalId[];
}

type CreateQuizFormProps = {
    quiz?: Quiz;
}

export function CreateQuizForm({ quiz }: CreateQuizFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!quiz;

  const [quizTitle, setQuizTitle] = useState(quiz?.title || "");
  const [quizDescription, setQuizDescription] = useState(quiz?.description || "");
  const [questions, setQuestions] = useState<QuestionWithLocalId[]>(
      quiz?.questions.map(q => ({...q, localId: Math.random()})) || []
    );
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: QuestionWithLocalId = {
      localId: Date.now(),
      id: String(Date.now()), // temp id
      text: "",
      type: type,
      correctAnswer: type === 'short-answer' ? [""] : "",
    };

    if (type === 'multiple-choice') {
      newQuestion.options = ["", "", "", ""];
    } else if (type === 'true-false') {
      newQuestion.options = ["True", "False"];
      newQuestion.correctAnswer = "True";
    }

    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (localId: number) => {
    setQuestions(questions.filter((q) => q.localId !== localId));
  };

  const handleQuestionChange = <T extends keyof QuestionWithLocalId>(localId: number, field: T, value: QuestionWithLocalId[T]) => {
     setQuestions(
      questions.map((q) => (q.localId === localId ? { ...q, [field]: value } : q))
    );
  };
  
  const handleOptionChange = (qLocalId: number, oIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.localId === qLocalId
          ? {
              ...q,
              options: q.options!.map((o, i) => (i === oIndex ? value : o)),
            }
          : q
      )
    );
  };

  const handleShortAnswerChange = (qLocalId: number, saIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.localId === qLocalId && Array.isArray(q.correctAnswer)) {
          const newAnswers = [...q.correctAnswer];
          newAnswers[saIndex] = value;
          return { ...q, correctAnswer: newAnswers };
        }
        return q;
      })
    );
  };

  const addShortAnswer = (qLocalId: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.localId === qLocalId && Array.isArray(q.correctAnswer)) {
          return { ...q, correctAnswer: [...q.correctAnswer, ""] };
        }
        return q;
      })
    );
  };

  const removeShortAnswer = (qLocalId: number, saIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.localId === qLocalId && Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1) {
          const newAnswers = q.correctAnswer.filter((_, i) => i !== saIndex);
          return { ...q, correctAnswer: newAnswers };
        }
        return q;
      })
    );
  };


  const handleSaveQuiz = async () => {
    if (!quizTitle || !quizDescription || questions.length === 0) {
        toast({ variant: "destructive", title: "Please fill all quiz fields." });
        return;
    }
    if (questions.some(q => 
        !q.text || 
        !q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.some(a => !a)) ||
        (q.type === 'multiple-choice' && q.options!.some(o => !o))
    )) {
        toast({ variant: "destructive", title: "Please complete all fields for each question." });
        return;
    }

    setIsSaving(true);
    try {
        const quizData = {
            title: quizTitle,
            description: quizDescription,
            questions: questions.map(({ localId, ...q }) => ({...q, id: String(Date.now() + Math.random())})),
        };
        
        if (isEditMode) {
            await updateQuiz(quiz.id, quizData);
            toast({
                title: "Quiz Updated!",
                description: "The quiz has been successfully updated.",
            });
            router.push('/admin/quizzes');
        } else {
            await createQuiz(quizData);
            toast({
                title: "Quiz Saved!",
                description: "The quiz has been successfully saved.",
            });
             setQuizTitle("");
            setQuizDescription("");
            setQuestions([]);
        }
       
        router.refresh();
    } catch(e: any) {
         toast({ variant: "destructive", title: "Error saving quiz.", description: e.message || 'An unknown error occurred.' });
    } finally {
        setIsSaving(false);
    }
  };


  const renderQuestionSpecificFields = (q: QuestionWithLocalId) => {
    switch (q.type) {
      case 'multiple-choice':
        return (
          <RadioGroup onValueChange={(value) => handleQuestionChange(q.localId, 'correctAnswer', value)} value={q.correctAnswer as string}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(q.options || []).map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={(q.options || [])[oIndex]} id={`q${q.localId}-o${oIndex}`} />
                          <Input
                              placeholder={`Option ${oIndex + 1}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(q.localId, oIndex, e.target.value)}
                              className="flex-1"
                          />
                      </div>
                  ))}
              </div>
          </RadioGroup>
        );
      case 'true-false':
        return (
          <RadioGroup onValueChange={(value) => handleQuestionChange(q.localId, 'correctAnswer', value)} value={q.correctAnswer as string} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="True" id={`q${q.localId}-true`} />
              <Label htmlFor={`q${q.localId}-true`}>True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="False" id={`q${q.localId}-false`} />
              <Label htmlFor={`q${q.localId}-false`}>False</Label>
            </div>
          </RadioGroup>
        );
      case 'short-answer':
        return (
          <div className="space-y-2">
            <Label>Correct Answers</Label>
            {Array.isArray(q.correctAnswer) && q.correctAnswer.map((ans, saIndex) => (
              <div key={saIndex} className="flex items-center gap-2">
                <Input
                  placeholder="Enter a correct answer"
                  value={ans}
                  onChange={(e) => handleShortAnswerChange(q.localId, saIndex, e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => removeShortAnswer(q.localId, saIndex)} disabled={q.correctAnswer.length <= 1}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addShortAnswer(q.localId)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Answer
            </Button>
          </div>
        );
      default:
        return null;
    }
  }


  return (
    <Card>
        <CardHeader>
        <CardTitle>{isEditMode ? "Edit Quiz" : "Create a New Quiz"}</CardTitle>
        <CardDescription>{isEditMode ? "Modify the details of your quiz." : "Fill out the details below to add a new quiz."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="quiz-title">Quiz Title</Label>
            <Input id="quiz-title" placeholder="e.g., Nigerian History 101" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="quiz-description">Quiz Description</Label>
            <Textarea id="quiz-description" placeholder="A brief description of what this quiz is about." value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} />
        </div>
        
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Questions</h3>
            {questions.map((q, qIndex) => (
            <Card key={q.localId} className="p-4 relative bg-background/50">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeQuestion(q.localId)}>
                    <X className="h-4 w-4" />
                </Button>
                <div className="space-y-4">
                <Label>Question {qIndex + 1} <span className="text-xs text-muted-foreground capitalize">({q.type.replace('-', ' ')})</span></Label>
                <Textarea placeholder={`Enter question text...`} value={q.text} onChange={(e) => handleQuestionChange(q.localId, 'text', e.target.value)} />
                {renderQuestionSpecificFields(q)}
                </div>
            </Card>
            ))}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addQuestion('multiple-choice')}>Multiple Choice</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addQuestion('true-false')}>True / False</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addQuestion('short-answer')}>Short Answer</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
        <Button onClick={handleSaveQuiz} size="lg" className="w-full" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 animate-spin" />}
            {isSaving ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Save Quiz')}
        </Button>
        </CardContent>
    </Card>
  );
}
