
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DisabledVideoGenerator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Video Generation</CardTitle>
        <CardDescription>
          Generate a short video from a text prompt. This feature is currently disabled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <Video className="h-4 w-4" />
          <AlertTitle>Billing Notice</AlertTitle>
          <AlertDescription>
            Video generation is disabled to prevent incurring costs. To enable this feature, you would need to upgrade to the Blaze plan and modify the component code.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="video-prompt">Video Prompt</Label>
          <Textarea
            id="video-prompt"
            placeholder="e.g., A majestic dragon soaring over a mystical forest at dawn."
            disabled
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input id="duration" type="number" placeholder="5" disabled />
            </div>
            <div className="space-y-2">
            <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
            <Input id="aspect-ratio" placeholder="16:9" disabled />
            </div>
        </div>
        <Button className="w-full" disabled>
          Generate Video
        </Button>
        <div className="mt-4 p-4 border-dashed border-2 rounded-md flex flex-col items-center justify-center h-48 bg-muted">
            <Video className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Video preview will appear here</p>
        </div>
      </CardContent>
    </Card>
  );
}
