
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, X, Loader2, ChevronDown, Video, Upload, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createQuiz, updateQuiz } from "@/services/quizService";
import { generateVideo } from "@/ai/flows/generate-video-flow";
import { type Question, type Quiz } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, type UploadTaskSnapshot } from "firebase/storage";


type QuestionWithLocalId = Question & { localId: number };

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

  // State for video handling
  const [videoPrompt, setVideoPrompt] = useState<{ [key: number]: string }>({});
  const [isGenerating, setIsGenerating] = useState<{ [key: number]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: QuestionWithLocalId = {
      localId: Date.now(),
      id: String(Date.now()), // temp id
      text: "",
      type: type,
      correctAnswer: "",
    };

    if (type === 'multiple-choice' || type === 'ai-video') {
      newQuestion.options = ["", "", "", ""];
    } else if (type === 'true-false') {
      newQuestion.options = ["True", "False"];
      newQuestion.correctAnswer = "True";
    } else if (type === 'short-answer') {
      newQuestion.correctAnswer = [""]; // Initialize as an array for short-answer
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

  const handleGenerateVideo = async (localId: number) => {
    const prompt = videoPrompt[localId];
    if (!prompt) {
      toast({ variant: "destructive", title: "Please enter a video prompt." });
      return;
    }

    setIsGenerating(prev => ({ ...prev, [localId]: true }));
    try {
      const result = await generateVideo({ prompt });
      if (result.videoUrl) {
        
        // Genkit returns a data URI, let's convert it to a blob for consistency
        const fetchRes = await fetch(result.videoUrl);
        const blob = await fetchRes.blob();
        const file = new File([blob], "generated-video.mp4", { type: "video/mp4" });

        // Now upload it like a regular file
        await handleVideoUpload(localId, file);

        toast({ title: "Video generated and uploaded successfully!" });
      } else {
        throw new Error("Video generation did not return a URL.");
      }
    } catch (error: any) {
      console.error("Video generation failed:", error);
      toast({ variant: "destructive", title: "Video Generation Failed", description: error.message || "An unknown error occurred." });
    } finally {
      setIsGenerating(prev => ({ ...prev, [localId]: false }));
    }
  };

  const handleVideoUpload = async (localId: number, file: File) => {
    if (!file) return;

    setUploadProgress(prev => ({ ...prev, [localId]: 0 }));
    
    const filePath = `quiz_videos/${quizTitle.replace(/\s+/g, '_') || 'quiz'}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
        (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => ({ ...prev, [localId]: progress }));
        },
        (error) => {
            console.error("Upload failed:", error);
            toast({ variant: "destructive", title: "Video Upload Failed", description: error.message || "An unknown error occurred." });
             setTimeout(() => setUploadProgress(prev => ({ ...prev, [localId]: undefined })), 2000);
        },
        async () => {
            try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                handleQuestionChange(localId, 'videoUrl', downloadURL);
                toast({ title: "Video uploaded successfully!" });
            } catch (error: any) {
                console.error("Failed to get download URL:", error);
                toast({ variant: "destructive", title: "Upload Finalization Failed", description: error.message });
            } finally {
                 setTimeout(() => setUploadProgress(prev => ({ ...prev, [localId]: undefined })), 2000);
            }
        }
    );
  };


  const handleSaveQuiz = async () => {
    if (!quizTitle || !quizDescription || questions.length === 0) {
        toast({ variant: "destructive", title: "Please fill all quiz fields." });
        return;
    }
    if (questions.some(q => 
        !q.text || 
        (q.type === 'ai-video' && !q.videoUrl) ||
        !q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.some(a => !a)) ||
        ((q.type === 'multiple-choice' || q.type === 'ai-video') && q.options!.some(o => !o))
    )) {
        toast({ variant: "destructive", title: "Please complete all fields for each question, including video for AI questions." });
        return;
    }

    setIsSaving(true);
    try {
        const quizData = {
            title: quizTitle,
            description: quizDescription,
            questions: questions.map(({ localId, ...q }) => ({...q, id: String(Date.now() + Math.random())})),
        };
        
        if (isEditMode && quiz) {
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
      case 'ai-video':
        return (
            <div className="space-y-4">
                {q.videoUrl ? (
                    <div className="space-y-4">
                        <div className="w-full aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            <video key={q.videoUrl} src={q.videoUrl} controls className="w-full h-full object-cover" />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleQuestionChange(q.localId, 'videoUrl', undefined)}>
                            <X className="mr-2 h-4 w-4" /> Replace Video
                        </Button>
                    </div>
                ) : (
                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate"><Wand2 className="mr-2"/>Generate</TabsTrigger>
                        <TabsTrigger value="upload"><Upload className="mr-2"/>Upload</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="p-1">
                         <div className="space-y-2 mt-2">
                            <Label htmlFor={`prompt-${q.localId}`}>AI Video Prompt</Label>
                            <Textarea 
                                id={`prompt-${q.localId}`} 
                                placeholder="A majestic dragon soaring over a mystical forest..." 
                                value={videoPrompt[q.localId] || ''}
                                onChange={(e) => setVideoPrompt(prev => ({...prev, [q.localId]: e.target.value}))}
                                disabled={isGenerating[q.localId]}
                            />
                            <Button onClick={() => handleGenerateVideo(q.localId)} disabled={isGenerating[q.localId] || uploadProgress[q.localId] !== undefined}>
                                {isGenerating[q.localId] && <Loader2 className="mr-2 animate-spin" />}
                                {isGenerating[q.localId] ? 'Generating...' : 'Generate Video'}
                            </Button>
                             {(isGenerating[q.localId] || uploadProgress[q.localId] !== undefined) && 
                                <Alert>
                                    <AlertTitle>Patience is a Virtue</AlertTitle>
                                    <AlertDescription>
                                        {isGenerating[q.localId] 
                                            ? "AI video generation can take up to a minute. Your video will be uploaded automatically when complete."
                                            : "Uploading video..."
                                        }
                                    </AlertDescription>
                                    {uploadProgress[q.localId] !== undefined && <Progress value={uploadProgress[q.localId]} className="w-full mt-2" />}
                                </Alert>
                             }
                        </div>
                    </TabsContent>
                    <TabsContent value="upload" className="p-1">
                        <div className="space-y-2 mt-2">
                            <Label>Upload Video File</Label>
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={(e) => e.target.files && handleVideoUpload(q.localId, e.target.files[0])}
                                disabled={uploadProgress[q.localId] !== undefined || isGenerating[q.localId]}
                            />
                            {uploadProgress[q.localId] !== undefined && (
                                <Progress value={uploadProgress[q.localId]} className="w-full" />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
                )}

                {q.videoUrl && (
                    <div className="pt-4 mt-4 border-t">
                        <Label>Answer Options (Select the correct one)</Label>
                        <RadioGroup onValueChange={(value) => handleQuestionChange(q.localId, 'correctAnswer', value)} value={q.correctAnswer as string}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
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
                    </div>
                )}
            </div>
        );
      case 'multiple-choice':
        return (
            <div>
            <Label>Answer Options (Select the correct one)</Label>
            <RadioGroup onValueChange={(value) => handleQuestionChange(q.localId, 'correctAnswer', value)} value={q.correctAnswer as string}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
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
          </div>
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
                  <div className="space-y-2">
                    <Label>Question {qIndex + 1} <span className="text-xs text-muted-foreground capitalize">({q.type.replace('-', ' ')})</span></Label>
                    <Textarea placeholder={`Enter question text...`} value={q.text} onChange={(e) => handleQuestionChange(q.localId, 'text', e.target.value)} />
                  </div>
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
                <DropdownMenuItem onClick={() => addQuestion('ai-video')}><Video className="mr-2"/>AI Video</DropdownMenuItem>
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
