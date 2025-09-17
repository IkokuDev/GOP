
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {CreateArticleInputSchema, type CreateArticleInput} from '@/lib/data';
import {addDoc, collection, Timestamp} from 'firebase/firestore';
import {db} from '@/lib/firebase';

const createArticleFlow = ai.defineFlow(
  {
    name: 'createArticleFlow',
    inputSchema: CreateArticleInputSchema,
    outputSchema: z.string(),
  },
  async (articleData) => {
    try {
      const docRef = await addDoc(collection(db, 'articles'), {
        ...articleData,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating article in flow:', error);
      throw new Error(error.message || 'Failed to create article in the flow.');
    }
  }
);

export async function createArticle(input: CreateArticleInput): Promise<string> {
    return await createArticleFlow(input);
}
