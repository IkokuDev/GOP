
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth.tsx";

function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M21.35 11.1H12.18v2.8h4.99c-.3 1.8-1.7 3.2-3.6 3.2-2.1 0-3.8-1.7-3.8-3.8s1.7-3.8 3.8-3.8c1.1 0 2.1.5 2.8 1.3l2.2-2.2c-1.4-1.3-3.3-2.1-5.3-2.1-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5c4.3 0 7.2-2.9 7.2-7.3 0-.6-.1-1.1-.2-1.6z"></path>
        </svg>
    )
}

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { signUp, signInWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
        await signUp(email, password, name);
        toast({
            title: "Account Created",
            description: "Welcome! Redirecting you to the homepage.",
        });
        router.push("/");
        router.refresh();
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Account Created",
        description: "Welcome! Redirecting you to the homepage.",
      });
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-Up Failed",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
        <CardDescription>Create an account to start your cultural journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
            <Button variant="outline" onClick={handleGoogleSignUp} disabled={isSubmitting || isGoogleSubmitting}>
              {isGoogleSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
              {isGoogleSubmitting ? "Redirecting..." : "Sign Up with Google"}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Adebayo" required value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting || isGoogleSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="m@example.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting || isGoogleSubmitting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting || isGoogleSubmitting}/>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-primary">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
