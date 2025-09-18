
"use server";
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { type UserProfile, type QuizHistory } from '@/lib/data';


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            uid: data.uid,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            score: data.score,
        };
    }
    return null;
}

export async function createUserProfile(user: UserProfile) {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, user);
}

export async function getUserQuizHistory(uid: string): Promise<QuizHistory[]> {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const data = userDoc.data();
        const history = (data.quizHistory || []) as any[];
        // Convert Firestore Timestamps to a serializable format (ISO string).
        return history.map(h => ({
            ...h,
            date: h.date instanceof Timestamp ? h.date.toDate().toISOString() : (typeof h.date === 'string' ? h.date : new Date().toISOString()),
        }));
    }
    
    return [];
}

