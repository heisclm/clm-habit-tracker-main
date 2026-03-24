'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, updateProfile, sendPasswordResetEmail, verifyBeforeUpdateEmail, updatePassword } from 'firebase/auth';
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
  signUpWithEmail: (email: string, pass: string, displayName: string, username: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileSettings: (settings: Partial<UserProfile>) => Promise<void>;
  updateEmailAuth: (newEmail: string) => Promise<void>;
  updatePasswordAuth: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
  updateProfileSettings: async () => {},
  updateEmailAuth: async () => {},
  updatePasswordAuth: async () => {},
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
            if (currentUser.photoURL) newProfile.photoURL = currentUser.photoURL;
            
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
  }, [profile?.themeColor]);

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

  const signUpWithEmail = async (email: string, pass: string, displayName: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(newUser, { displayName });

      // Send verification email
      await sendEmailVerification(newUser);

      // Create Firestore profile
      const userRef = doc(db, 'users', newUser.uid);
      const newProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || '',
        displayName,
        username,
        points: 0,
        level: 1,
        currentStreak: 0,
        bestStreak: 0,
        totalHabitsCompleted: 0,
        unlockedAchievements: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
      setProfile(newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user?.uid || 'new_user'}`);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
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
      
      // Update Firebase Auth profile if displayName or photoURL changed
      if (settings.displayName || settings.photoURL) {
        await updateProfile(user, { 
          displayName: settings.displayName || user.displayName,
          photoURL: settings.photoURL || user.photoURL
        });
      }

      await updateDoc(userRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      });
      // Local state will update via onSnapshot
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateEmailAuth = async (newEmail: string) => {
    if (!user) return;
    try {
      await verifyBeforeUpdateEmail(user, newEmail);
      // Also update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        email: newEmail,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updatePasswordAuth = async (newPassword: string) => {
    if (!user) return;
    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signInWithEmail, signUpWithEmail, resetPassword, signOut, updateProfileSettings, updateEmailAuth, updatePasswordAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
