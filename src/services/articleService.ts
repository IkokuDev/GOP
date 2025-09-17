
"use server";
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, Timestamp, query, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';
import { type Article, type CreateArticleInput } from '@/lib/data';
import { revalidatePath } from 'next/cache';

function docToArticle(doc: any): Article {
  const data = doc.data();
  // Convert Firestore Timestamp to a serializable ISO string.
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();

  return {
    id: doc.id,
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl,
    imageHint: data.imageHint,
    quizId: data.quizId,
    createdAt: createdAt as any, // Cast to any to satisfy the type, it's a string now
    userId: data.userId,
  };
}

export async function getArticles(): Promise<Article[]> {
  const articlesCollection = collection(db, "articles");
  const q = query(articlesCollection, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToArticle);
}

export async function getArticle(id: string): Promise<Article | null> {
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docToArticle(docSnap);
  } else {
    return null; 
  }
}

export async function createArticle(articleData: CreateArticleInput): Promise<string> {
    const docRef = await addDoc(collection(db, "articles"), {
        ...articleData,
        createdAt: Timestamp.now(),
    });
    revalidatePath('/admin/content');
    revalidatePath('/');
    return docRef.id;
}

export async function updateArticle(id: string, updates: Partial<Omit<Article, 'id' | 'createdAt'>>) {
    const docRef = doc(db, "articles", id);
    await updateDoc(docRef, updates);
    revalidatePath(`/admin/content`);
    revalidatePath(`/content/${id}`);
    revalidatePath('/');
}

export async function deleteArticle(id: string) {
    const docRef = doc(db, "articles", id);
    await deleteDoc(docRef);
    revalidatePath('/admin/content');
    revalidatePath('/');
}
