'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useHabits } from '@/hooks/useHabits';
import { format } from 'date-fns';
import { Plus, Trash2, CheckCircle, Circle, Trophy, Flame, Star, LogOut, MessageSquare, Mic, Image as ImageIcon, Eye, EyeOff, BarChart3, Target, Award, Settings as SettingsIcon } from 'lucide-react';
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

import { PlayerCard } from '@/components/PlayerCard';
import { QuestList } from '@/components/QuestList';

export default function Home() {
  const { user, profile, loading, signIn, signInWithEmail, signUpWithEmail, resetPassword, signOut } = useAuth();
  const { habits, logs, loading: habitsLoading, addHabit, deleteHabit, toggleHabit } = useHabits();
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [prevLevel, setPrevLevel] = useState(profile?.level || 1);
  const [recentAchievements, setRecentAchievements] = useState<string[]>([]);
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const totalHabits = habits.length;
  const completedHabits = habits.filter(habit => logs.some(log => log.habitId === habit.id && log.date === today)).length;
  const allCompleted = totalHabits > 0 && completedHabits === totalHabits;

  // Trigger confetti on full completion
  useEffect(() => {
    if (allCompleted) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669']
      });
    }
  }, [allCompleted]);

  // Clear auth form when user signs out
  useEffect(() => {
    if (!user) {
      setEmail('');
      setPassword('');
      setName('');
      setUsername('');
      setShowPassword(false);
      setVerificationSent(false);
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
      setAuthSuccess('');
      setIsAuthLoading(true);
      try {
        if (isResetPassword) {
          await resetPassword(email);
          setAuthSuccess('Password reset link sent to your email.');
        } else if (isSignUp) {
          if (!name.trim() || !username.trim()) {
            throw new Error('Name and Username are required');
          }
          await signUpWithEmail(email, password, name.trim(), username.trim());
          setVerificationSent(true);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-zinc-100 p-4 relative overflow-hidden w-full">
        {/* Futuristic Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_70%)]"></div>
        </div>

        <div className="max-w-md w-full text-center space-y-8 z-10">
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase italic">
              CLm
            </h1>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary-500 to-transparent mx-auto"></div>
            <p className="text-sm font-mono tracking-[0.3em] text-primary-400 uppercase">Neural Habit Interface</p>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-500/30 rounded-tl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-500/30 rounded-br-3xl"></div>

            {verificationSent ? (
              <div className="space-y-6 py-4">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-primary-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Verify Your Email</h3>
                  <p className="text-zinc-400 text-sm">
                    We&apos;ve sent a verification link to <span className="text-white font-medium">{email}</span>. 
                    Please check your inbox to activate your neural link.
                  </p>
                </div>
                <button
                  onClick={() => setVerificationSent(false)}
                  className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2">
                    {isResetPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
                  </h2>

                  {authError && (
                    <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
                      [ERROR]: {authError}
                    </div>
                  )}

                  {authSuccess && (
                    <div className="p-3 bg-primary-950/30 border border-primary-500/30 rounded-xl text-primary-400 text-xs font-mono">
                      [SUCCESS]: {authSuccess}
                    </div>
                  )}
                  
                  {isSignUp && !isResetPassword && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 ml-1">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                          placeholder="johndoe"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                      placeholder="neural@interface.com"
                    />
                  </div>

                  {!isResetPassword && (
                    <div className="space-y-1.5 text-left relative">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 ml-1">Password</label>
                        {!isSignUp && (
                          <button
                            type="button"
                            onClick={() => setIsResetPassword(true)}
                            className="text-[9px] font-mono uppercase tracking-widest text-primary-500 hover:text-primary-400 transition-colors"
                          >
                            Lost Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 pr-12 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-3.5 px-4 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                  >
                    {isAuthLoading ? 'Processing...' : isResetPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
                  </button>

                  {isResetPassword && (
                    <button
                      type="button"
                      onClick={() => setIsResetPassword(false)}
                      className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-primary-400 transition-colors w-full"
                    >
                      Back to Login
                    </button>
                  )}
                </form>

                {!isResetPassword && (
                  <>
                    <div className="flex items-center gap-4 py-2">
                      <div className="flex-1 h-px bg-white/5"></div>
                      <span className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest">or</span>
                      <div className="flex-1 h-px bg-white/5"></div>
                    </div>

                    <button
                      onClick={signIn}
                      className="w-full py-3 px-4 bg-zinc-800/50 hover:bg-zinc-800 text-white border border-white/5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-3"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google Authentication
                    </button>

                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-primary-400 transition-colors pt-2"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    await addHabit(newHabitTitle.trim());
    setNewHabitTitle('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-24 relative overflow-x-hidden w-full">
      <NotificationManager />
      
      {/* Futuristic Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[5%] w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0,transparent_80%)]"></div>
      </div>

      {/* Verification Notice */}
      {user && !user.emailVerified && (
        <div className="bg-violet-500/10 border-b border-violet-500/20 p-2 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-violet-400 relative z-10">
          Account pending verification. Please check your email.
        </div>
      )}

      {/* Toast for new achievements */}
      {recentAchievements.length > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
          {recentAchievements.map(id => {
            const ach = ACHIEVEMENTS.find(a => a.id === id);
            if (!ach) return null;
            return (
              <div key={id} className="bg-violet-900/90 border border-violet-500/50 text-white px-6 py-3 rounded-full shadow-2xl shadow-violet-900/50 flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300">
                <Trophy className="w-5 h-5 text-violet-300" />
                <div>
                  <p className="text-xs text-violet-300 font-bold uppercase tracking-wider">Achievement Unlocked!</p>
                  <p className="font-medium">{ach.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Header Navigation */}
      <header className="bg-black/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] font-bold">System Online</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ShareModal />
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-zinc-400 hover:text-violet-400 transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
              title="System Configuration"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <Link href="/progress" className="p-2 text-zinc-400 hover:text-cyan-400 transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5">
              <BarChart3 className="w-4 h-4" />
            </Link>
            <button onClick={signOut} className="p-2 text-zinc-500 hover:text-red-400 transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10 relative z-10">
        {/* Player Profile Section */}
        <PlayerCard onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Settings Modal (Controlled) */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Trophy, label: 'XP Points', value: profile?.points || 0, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { icon: Flame, label: 'Streak', value: profile?.currentStreak || 0, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { icon: Star, label: 'Best Record', value: profile?.bestStreak || 0, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center group hover:border-white/10 transition-all relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10 rounded-tl-2xl`}></div>
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
              <span className="text-3xl font-black tracking-tighter text-white">{stat.value}</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-1">{stat.label}</span>
            </div>
          ))}
          <AchievementsModal />
        </div>

        {/* Quest Board */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
                <Target className="w-6 h-6 text-emerald-500" />
                Daily Quests
              </h2>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Cycle: {format(new Date(), 'yyyy.MM.dd')} {'//'} {completedHabits}/{totalHabits} Verified
              </p>
            </div>
            {allCompleted && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full animate-bounce">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-bold">All Clear</span>
              </div>
            )}
          </div>

          {/* Add Quest Input */}
          <div className="flex gap-3">
            <form onSubmit={handleAddHabit} className="flex flex-1 gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Initiate new protocol..."
                  className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder:text-zinc-600 font-mono"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-700 uppercase tracking-widest pointer-events-none">_CMD</div>
              </div>
              <button
                type="submit"
                disabled={!newHabitTitle.trim()}
                className="bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl px-8 py-4 transition-all flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 font-black uppercase tracking-tighter italic text-sm"
              >
                Deploy
              </button>
            </form>
            <GoalSetter />
          </div>

          {/* Quest List Component */}
          <QuestList />
        </div>
      </main>

      {/* AI Features Floating Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-4 flex items-center gap-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] z-30">
        <Chatbot />
        <div className="w-px h-8 bg-white/10" />
        <VoiceCoach />
        <div className="w-px h-8 bg-white/10" />
        <VisionBoard />
      </div>
    </div>
  );
}
