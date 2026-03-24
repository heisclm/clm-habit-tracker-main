export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  username?: string;
  points: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  totalHabitsCompleted?: number;
  unlockedAchievements?: string[];
  themeColor?: string;
  fontFamily?: string;
  photoURL?: string;
  lastActiveDate?: string; // YYYY-MM-DD
  createdAt?: any; // Timestamp
  updatedAt?: any; // Timestamp
}

export interface Habit {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  reminderTime?: string; // HH:MM
  createdAt: any; // Timestamp
  updatedAt?: any; // Timestamp
}

export interface HabitLog {
  id?: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: any; // Timestamp
}
