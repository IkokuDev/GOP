
"use server";
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { type Article, type CreateArticleInput } from '@/lib/data';
import { revalidatePath } from 'next/cache';

function docToArticle(doc: any): Article {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl,
    imageHint: data.imageHint,
    quizId: data.quizId,
    createdAt: (data.createdAt as Timestamp).toDate(),
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
    return null; // Don't use notFound() here to allow for creation pages
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

export async function updateArticle(id: string, articleData: Partial<CreateArticleInput>): Promise<void> {
    const docRef = doc(db, "articles", id);
    await updateDoc(docRef, {
        ...articleData,
    });
    revalidatePath('/admin/content');
    revalidatePath(`/admin/content/edit/${id}`);
    revalidatePath(`/content/${id}`);
    revalidatePath('/');
}

export async function deleteArticle(id: string): Promise<void> {
    const docRef = doc(db, "articles", id);
    await deleteDoc(docRef);
    revalidatePath('/admin/content');
    revalidatePath('/');
}
