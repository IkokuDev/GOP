
"use server";
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, arrayUnion, Timestamp, query, orderBy, deleteDoc } from 'firebase/firestore';
import { type Quiz, type Question } from '@/lib/data';
import { revalidatePath } from 'next/cache';

function docToQuiz(doc: any): Quiz {
  const data = doc.data();
  // Firestore Timestamps need to be converted to a serializable format (ISO string).
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
  
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    articleId: data.articleId,
    questions: data.questions,
    createdAt: createdAt,
  };
}

export async function getQuizzes(): Promise<Quiz[]> {
  const quizzesCollection = collection(db, "quizzes");
  const q = query(quizzesCollection, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docToQuiz);
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  const docRef = doc(db, "quizzes", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docToQuiz(docSnap);
  }
  return null;
}

export async function createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<string> {
    const quizData = {
        ...quiz,
        questions: quiz.questions.map(q => ({...q})), // Ensure questions are plain objects
        createdAt: Timestamp.now(),
    }
    const docRef = await addDoc(collection(db, "quizzes"), quizData);
    revalidatePath('/admin/quizzes');
    revalidatePath('/quizzes');
    return docRef.id;
}

export async function updateQuiz(id: string, quiz: Omit<Quiz, 'id' | 'createdAt'>) {
    const docRef = doc(db, "quizzes", id);
    const quizData = {
        ...quiz,
        questions: quiz.questions.map(q => ({...q})),
    }
    await updateDoc(docRef, quizData);
    revalidatePath('/admin/quizzes');
    revalidatePath(`/quizzes/${id}`);
}


export async function deleteQuiz(id: string) {
    const docRef = doc(db, "quizzes", id);
    await deleteDoc(docRef);
    revalidatePath('/admin/quizzes');
    revalidatePath('/quizzes');
}

export async function recordQuizResult(userId: string, quizId: string, score: number, totalQuestions: number) {
    const userRef = doc(db, "users", userId);
    
    const points = score * 10; // e.g., 10 points per correct answer

    const historyEntry = {
        quizId,
        score,
        totalQuestions,
        date: Timestamp.now(),
    }
    
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const currentScore = userDoc.data().score || 0;
      await updateDoc(userRef, {
          score: currentScore + points,
          quizHistory: arrayUnion(historyEntry)
      });
    }
}
