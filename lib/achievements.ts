export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_habit', title: 'First Step', description: 'Complete your first habit', icon: 'Star' },
  { id: 'streak_3', title: 'On a Roll', description: 'Reach a 3-day streak', icon: 'Flame' },
  { id: 'streak_7', title: 'Unstoppable', description: 'Reach a 7-day streak', icon: 'Zap' },
  { id: 'streak_30', title: 'Habit Master', description: 'Reach a 30-day streak', icon: 'Crown' },
  { id: 'habits_10', title: 'Getting Serious', description: 'Complete 10 habits total', icon: 'Target' },
  { id: 'habits_50', title: 'Habit Machine', description: 'Complete 50 habits total', icon: 'Award' },
  { id: 'habits_100', title: 'Centurion', description: 'Complete 100 habits total', icon: 'Trophy' },
  { id: 'level_5', title: 'Level 5 Achiever', description: 'Reach Level 5', icon: 'TrendingUp' },
  { id: 'level_10', title: 'Level 10 Legend', description: 'Reach Level 10', icon: 'Sparkles' },
];

export function checkAchievements(profile: {
  totalHabitsCompleted?: number;
  currentStreak: number;
  level: number;
  unlockedAchievements?: string[];
}) {
  const unlocked = new Set(profile.unlockedAchievements || []);
  const newlyUnlocked: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !unlocked.has(id)) {
      unlocked.add(id);
      newlyUnlocked.push(id);
    }
  };

  const total = profile.totalHabitsCompleted || 0;

  check('first_habit', total >= 1);
  check('habits_10', total >= 10);
  check('habits_50', total >= 50);
  check('habits_100', total >= 100);
  
  check('streak_3', profile.currentStreak >= 3);
  check('streak_7', profile.currentStreak >= 7);
  check('streak_30', profile.currentStreak >= 30);
  
  check('level_5', profile.level >= 5);
  check('level_10', profile.level >= 10);

  return {
    unlockedAchievements: Array.from(unlocked),
    newlyUnlocked
  };
}
