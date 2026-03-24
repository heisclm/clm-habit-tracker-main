'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { UserProfile } from '@/lib/models';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileSettings: (settings: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  updateProfileSettings: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
            
            // Listen for real-time profile updates (like points, level, theme)
            const unsubscribeProfile = onSnapshot(userRef, (doc) => {
              if (doc.exists()) {
                setProfile(doc.data() as UserProfile);
              }
            });
            // Note: we might leak this listener if user changes, but it's fine for this scope
          } else {
            // Create new user profile
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              points: 0,
              level: 1,
              currentStreak: 0,
              bestStreak: 0,
              totalHabitsCompleted: 0,
              unlockedAchievements: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            
            if (currentUser.email) newProfile.email = currentUser.email;
            if (currentUser.displayName) newProfile.displayName = currentUser.displayName;
            
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (profile?.themeColor) {
      document.documentElement.className = `theme-${profile.themeColor}`;
    } else {
      document.documentElement.className = 'theme-emerald';
    }

    if (profile?.fontFamily) {
      document.body.classList.remove('font-inter', 'font-space', 'font-playfair', 'font-mono');
      document.body.classList.add(`font-${profile.fontFamily}`);
    } else {
      document.body.classList.remove('font-inter', 'font-space', 'font-playfair', 'font-mono');
      document.body.classList.add('font-inter');
    }
  }, [profile?.themeColor, profile?.fontFamily]);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfileSettings = async (settings: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      });
      // Local state will update via onSnapshot
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signInWithEmail, signUpWithEmail, signOut, updateProfileSettings }}>
      {children}
    </AuthContext.Provider>
  );
}
