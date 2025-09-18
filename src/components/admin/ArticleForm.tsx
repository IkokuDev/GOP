
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle } from "@/services/articleService";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth.tsx";
import { type Article, CreateArticleInputSchema } from "@/lib/data";

const formSchema = CreateArticleInputSchema.omit({ userId: true, imageUrl: true }).extend({
    imageHint: z.string().min(2, { message: "Image hint must be at least 2 characters." }),
});

type ArticleFormProps = {
    article?: Article;
}

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!article;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article?.title || "",
      content: article?.content || "",
      imageHint: article?.imageHint || "",
    },
  });

  const { formState: { isSubmitting }, handleSubmit, control, reset } = form;

  const processSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to manage articles.",
      });
      return;
    }
    
    try {
      if (isEditMode && article) {
        // Update existing article
        const articleData = {
          title: values.title,
          content: values.content,
          imageHint: values.imageHint,
        };
        await updateArticle(article.id, articleData);
        toast({
          title: "Article Updated!",
          description: "Your changes have been saved.",
        });
        router.push(`/admin/content`);
      } else {
        // Create new article
        const imageUrl = `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/1200/800`;
        const articleData = {
          ...values,
          imageUrl,
          userId: user.uid,
        };
        const newArticleId = await createArticle(articleData);
        toast({
          title: "Article Published!",
          description: "Your new article is now live.",
        });
        router.push(`/content/${newArticleId}`);
      }
      router.refresh();
    } catch (error: any) {
      console.error("Error processing article: ", error);
      toast({
        variant: "destructive",
        title: "Error Processing Article",
        description: error.message || "An unknown error occurred.",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Title</FormLabel>
                  <FormControl>
                    <Input placeholder="The Art of Nigerian Pottery" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nigerian pottery is a rich and diverse tradition..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={control}
              name="imageHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Hint for AI</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 'nigerian pottery'" {...field} />
                  </FormControl>
                  <FormDescription>
                    Keywords to help AI find related images in the future. This will be used for the placeholder image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : null}
              {isSubmitting ? (isEditMode ? 'Saving Changes...' : 'Publishing...') : (isEditMode ? 'Save Changes' : 'Publish Article')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
