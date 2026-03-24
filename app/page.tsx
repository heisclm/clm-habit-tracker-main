'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useHabits } from '@/hooks/useHabits';
import { format } from 'date-fns';
import { Plus, Trash2, CheckCircle, Circle, Trophy, Flame, Star, LogOut, MessageSquare, Mic, Image as ImageIcon, Eye, EyeOff, BarChart3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { Chatbot } from '@/components/Chatbot';
import { VoiceCoach } from '@/components/VoiceCoach';
import { VisionBoard } from '@/components/VisionBoard';
import { GoalSetter } from '@/components/GoalSetter';
import { AchievementsModal } from '@/components/AchievementsModal';
import { SettingsModal } from '@/components/SettingsModal';
import { ShareModal } from '@/components/ShareModal';
import { ReminderButton } from '@/components/ReminderButton';
import { NotificationManager } from '@/components/NotificationManager';
import { ACHIEVEMENTS } from '@/lib/achievements';

export default function Home() {
  const { user, profile, loading, signIn, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const { habits, logs, loading: habitsLoading, addHabit, deleteHabit, toggleHabit } = useHabits();
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [prevLevel, setPrevLevel] = useState(profile?.level || 1);
  const [recentAchievements, setRecentAchievements] = useState<string[]>([]);
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Clear auth form when user signs out
  useEffect(() => {
    if (!user) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }
  }, [user]);

  // Trigger confetti on level up
  useEffect(() => {
    if (profile && profile.level > prevLevel) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6']
      });
      setPrevLevel(profile.level);
    } else if (profile && profile.level < prevLevel) {
      setPrevLevel(profile.level);
    }
  }, [profile, prevLevel]);

  // Clear recent achievements after a few seconds
  useEffect(() => {
    if (recentAchievements.length > 0) {
      const timer = setTimeout(() => setRecentAchievements([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [recentAchievements]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    const handleEmailAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setIsAuthLoading(true);
      try {
        if (isSignUp) {
          await signUpWithEmail(email, password);
        } else {
          await signInWithEmail(email, password);
        }
      } catch (err: any) {
        if (err.code === 'auth/operation-not-allowed') {
          setAuthError('Email/Password sign-in is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method.');
        } else {
          setAuthError(err.message || 'Authentication failed');
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">
              CLm
            </h1>
            <p className="text-xl text-zinc-400">Gamified Habit Tracker</p>
          </div>
          <p className="text-zinc-500">
            Level up your life by building good habits. Earn points, maintain streaks, and unlock your potential.
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm">
                  {authError}
                </div>
              )}
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-zinc-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2 text-left relative">
                <label className="text-sm font-medium text-zinc-400">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-900/20"
              >
                {isAuthLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-zinc-800"></div>
              <span className="text-xs text-zinc-500 uppercase font-medium">or</span>
              <div className="flex-1 h-px bg-zinc-800"></div>
            </div>

            <button
              onClick={signIn}
              className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-all"
            >
              Continue with Google
            </button>

            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError('');
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors pt-2"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const pointsToNextLevel = (profile?.level || 1) * 100;
  const progress = ((profile?.points || 0) % 100) / 100 * 100;

  const totalHabits = habits.length;
  const completedHabits = habits.filter(habit => logs.some(log => log.habitId === habit.id && log.date === today)).length;
  const dailyProgressPercent = totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    await addHabit(newHabitTitle.trim());
    setNewHabitTitle('');
  };

  const handleToggleHabit = async (habitId: string) => {
    const { newlyUnlocked } = await toggleHabit(habitId);
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      setRecentAchievements(newlyUnlocked);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#d946ef', '#ec4899']
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative">
      <NotificationManager />
      {/* Toast for new achievements */}
      {recentAchievements.length > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
          {recentAchievements.map(id => {
            const ach = ACHIEVEMENTS.find(a => a.id === id);
            if (!ach) return null;
            return (
              <div key={id} className="bg-purple-900/90 border border-purple-500/50 text-white px-6 py-3 rounded-full shadow-2xl shadow-purple-900/50 flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300">
                <Trophy className="w-5 h-5 text-purple-300" />
                <div>
                  <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Achievement Unlocked!</p>
                  <p className="font-medium">{ach.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-primary-300 flex items-center justify-center font-bold text-lg shadow-lg">
              {profile?.level || 1}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{user.displayName || 'Hero'}</h1>
              <p className="text-xs text-zinc-400">Level {profile?.level || 1} Achiever</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShareModal />
            <SettingsModal />
            <Link href="/progress" className="p-2 text-zinc-400 hover:text-cyan-400 transition-colors bg-zinc-950 hover:bg-zinc-800 rounded-xl border border-zinc-800 flex items-center gap-2 text-sm font-medium mr-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </Link>
            <button onClick={signOut} className="p-2 text-zinc-400 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
            <span className="text-2xl font-bold">{profile?.points || 0}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Points</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Flame className="w-6 h-6 text-orange-500 mb-2" />
            <span className="text-2xl font-bold">{profile?.currentStreak || 0}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Day Streak</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Star className="w-6 h-6 text-cyan-500 mb-2" />
            <span className="text-2xl font-bold">{profile?.bestStreak || 0}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Best Streak</span>
          </div>
          <AchievementsModal />
        </div>

        {/* Level Progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-zinc-400">Progress to Level {(profile?.level || 1) + 1}</span>
            <span className="text-primary-400">{profile?.points || 0} / {pointsToNextLevel} XP</span>
          </div>
          <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-primary-300 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Daily Progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-zinc-400">Today's Goals</span>
            <span className="text-cyan-400">{completedHabits} of {totalHabits} Habits Completed</span>
          </div>
          <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-500 ease-out"
              style={{ width: `${dailyProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daily Quests</h2>
            <span className="text-sm text-zinc-500">{format(new Date(), 'EEEE, MMM d')}</span>
          </div>

          <div className="flex gap-2">
            <form onSubmit={handleAddHabit} className="flex flex-1 gap-2">
              <input
                type="text"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                placeholder="Add a new habit..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!newHabitTitle.trim()}
                className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
            <GoalSetter />
          </div>

          {habitsLoading ? (
            <div className="text-center py-8 text-zinc-500">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl border-dashed">
              <p className="text-zinc-500">No habits yet. Start your journey by adding one above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map(habit => {
                const isCompleted = logs.some(log => log.habitId === habit.id && log.date === today);
                return (
                  <div 
                    key={habit.id}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isCompleted 
                        ? 'bg-primary-950/20 border-primary-900/50' 
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleHabit(habit.id!)}
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 transition-colors" />
                      )}
                      <span className={`font-medium transition-all ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                        {habit.title}
                      </span>
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <ReminderButton habit={habit} />
                      <button
                        onClick={() => deleteHabit(habit.id!)}
                        className="p-2 text-zinc-600 hover:text-red-400 transition-all"
                        title="Delete habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* AI Features Floating Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl">
        <Chatbot />
        <div className="w-px h-6 bg-zinc-800" />
        <VoiceCoach />
        <div className="w-px h-6 bg-zinc-800" />
        <VisionBoard />
      </div>
    </div>
  );
}
