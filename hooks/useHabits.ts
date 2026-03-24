import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/components/AuthProvider';
import { Habit, HabitLog, UserProfile } from '@/lib/models';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { format, differenceInDays, parseISO } from 'date-fns';
import { checkAchievements } from '@/lib/achievements';

export function useHabits() {
  const { user, profile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHabits([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid)
    );

    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
      const newHabits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];
      setHabits(newHabits);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'habits');
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    const logsQuery = query(
      collection(db, 'habitLogs'),
      where('userId', '==', user.uid),
      where('date', '==', today)
    );

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HabitLog[];
      setLogs(newLogs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'habitLogs');
    });

    return () => {
      unsubscribeHabits();
      unsubscribeLogs();
    };
  }, [user]);

  const addHabit = async (title: string, description?: string, reminderTime?: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const newHabitRef = doc(collection(db, 'habits'));
      
      const habitData: any = {
        userId: user.uid,
        title,
        description: description || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (reminderTime) {
        habitData.reminderTime = reminderTime;
      }
      
      batch.set(newHabitRef, habitData);
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'habits');
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const habitRef = doc(db, 'habits', habitId);
      
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      batch.update(habitRef, updateData);
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `habits/${habitId}`);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'habits', habitId));
      
      // Also delete logs for this habit
      const logsQuery = query(collection(db, 'habitLogs'), where('habitId', '==', habitId));
      const logsSnapshot = await getDocs(logsQuery);
      logsSnapshot.forEach((logDoc) => {
        batch.delete(logDoc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `habits/${habitId}`);
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user || !profile) return { newlyUnlocked: [] };
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingLog = logs.find(log => log.habitId === habitId && log.date === today);
    let newlyUnlocked: string[] = [];
    
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', user.uid);
      
      // We need the latest user profile to ensure atomic updates
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return { newlyUnlocked: [] };
      
      const currentProfile = userSnap.data() as UserProfile;
      let { points, level, currentStreak, bestStreak, lastActiveDate, totalHabitsCompleted = 0, unlockedAchievements = [] } = currentProfile;
      
      if (existingLog) {
        // Uncomplete
        batch.delete(doc(db, 'habitLogs', existingLog.id!));
        points = Math.max(0, points - 10);
        level = Math.floor(points / 100) + 1;
        totalHabitsCompleted = Math.max(0, totalHabitsCompleted - 1);
        
        // We don't revert streak easily here unless we query yesterday's logs.
        // For MVP, we'll just leave the streak alone if they uncheck, or they might lose it tomorrow.
      } else {
        // Complete
        const newLogRef = doc(collection(db, 'habitLogs'));
        batch.set(newLogRef, {
          userId: user.uid,
          habitId,
          date: today,
          completedAt: serverTimestamp(),
        });
        
        points += 10;
        level = Math.floor(points / 100) + 1;
        totalHabitsCompleted += 1;
        
        if (!lastActiveDate) {
          currentStreak = 1;
        } else if (lastActiveDate !== today) {
          const daysDiff = differenceInDays(parseISO(today), parseISO(lastActiveDate));
          if (daysDiff === 1) {
            currentStreak += 1;
          } else if (daysDiff > 1) {
            currentStreak = 1;
          }
        }
        
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
        }
        lastActiveDate = today;
      }

      // Check for achievements
      const achievementResult = checkAchievements({
        totalHabitsCompleted,
        currentStreak,
        level,
        unlockedAchievements
      });
      
      unlockedAchievements = achievementResult.unlockedAchievements;
      newlyUnlocked = achievementResult.newlyUnlocked;
      
      batch.update(userRef, {
        points,
        level,
        currentStreak,
        bestStreak,
        lastActiveDate,
        totalHabitsCompleted,
        unlockedAchievements,
        updatedAt: serverTimestamp(),
      });
      
      await batch.commit();
      return { newlyUnlocked };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'habitLogs');
      return { newlyUnlocked: [] };
    }
  };

  return {
    habits,
    logs,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
  };
}
