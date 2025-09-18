
'use server';
/**
 * @fileOverview A Genkit flow for generating video from a text prompt.
 * 
 * - generateVideo - The exported function that triggers the video generation flow.
 * - GenerateVideoInput - The Zod schema for the input.
 * - GenerateVideoOutput - The Zod schema for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Define Zod schemas for input and output
const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the video from.'),
  durationSeconds: z.number().optional().default(5),
  aspectRatio: z.string().optional().default('16:9'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoUrl: z.string().describe("A data URI of the generated video. Expected format: 'data:video/mp4;base64,<encoded_data>'."),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;


/**
 * The main flow for generating a video.
 */
const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: input.prompt,
      config: {
        durationSeconds: input.durationSeconds,
        aspectRatio: input.aspectRatio,
        personGeneration: 'allow_adult',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation.');
    }

    // Poll for completion
    while (!operation.done) {
      // Wait for 5 seconds before checking again.
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
      console.error('Video generation operation failed:', operation.error);
      throw new Error(`Failed to generate video: ${operation.error.message}`);
    }

    const video = operation.output?.message?.content.find((p) => !!p.media);
    if (!video || !video.media?.url) {
      throw new Error('Failed to find the generated video in the operation result.');
    }

     // Make sure the data URI has the mime type. Veo might not include it.
    let videoUrl = video.media.url;
    if (!videoUrl.startsWith('data:')) {
        videoUrl = `data:video/mp4;base64,${videoUrl}`;
    }

    return {
      videoUrl: videoUrl, 
    };
  }
);


/**
 * Exported wrapper function to be called from the frontend.
 */
export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
  return await generateVideoFlow(input);
}
