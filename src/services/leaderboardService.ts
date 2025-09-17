
"use server";
import { type LeaderboardEntry } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("score", "desc"), limit(20));
    
    const querySnapshot = await getDocs(q);

    const leaderboard = querySnapshot.docs.map((doc, index) => {
        const user = doc.data();
        return {
            rank: index + 1,
            name: user.name,
            score: user.score,
            avatar: user.avatar,
        };
    });

    return leaderboard;
}
