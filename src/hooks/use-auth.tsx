
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from '@/services/userService';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const signIn = (email: string, pass: string) => {
      return signInWithEmailAndPassword(auth, email, pass);
  }

  const signUp = async (email: string, pass: string, name: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      
      if(user) {
        const photoURL = `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(name)}`;
        await updateProfile(user, { displayName: name, photoURL });

        // Create user profile in Firestore
        await createUserProfile({
          uid: user.uid,
          name: name,
          email: email,
          avatar: photoURL,
          score: 0,
        });

        // Re-fetch user to get updated profile
        setUser({ ...user, displayName: name, photoURL });
      }

      return userCredential;
  }

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user already exists in our database
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      // New user, create a profile
      const photoURL = user.photoURL || `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(user.displayName || user.email || 'user')}`;
       await createUserProfile({
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        email: user.email!,
        avatar: photoURL,
        score: 0,
       });
       // Ensure local user object is updated
       setUser({ ...user, displayName: user.displayName || 'Anonymous', photoURL });
    }
    return result;
  }

  const logOut = async () => {
    await signOut(auth);
    router.push('/');
  }


  const value = { user, loading, signIn, signUp, signOut: logOut, signInWithGoogle };

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
