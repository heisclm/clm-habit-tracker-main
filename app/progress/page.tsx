'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Habit, HabitLog } from '@/lib/models';
import { format, subDays, parseISO, eachDayOfInterval } from 'date-fns';
import { ArrowLeft, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function ProgressPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all habits
        const habitsQuery = query(
          collection(db, 'habits'),
          where('userId', '==', user.uid)
        );
        const habitsSnapshot = await getDocs(habitsQuery);
        const fetchedHabits = habitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Habit[];
        setHabits(fetchedHabits);

        // Fetch logs from the last 30 days
        const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        const logsQuery = query(
          collection(db, 'habitLogs'),
          where('userId', '==', user.uid),
          where('date', '>=', thirtyDaysAgo)
        );
        const logsSnapshot = await getDocs(logsQuery);
        const fetchedLogs = logsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HabitLog[];
        setLogs(fetchedLogs);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
        <p>Please sign in to view your progress.</p>
      </div>
    );
  }

  // Process data for charts
  const today = new Date();
  const last30Days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  }).map(date => format(date, 'yyyy-MM-dd'));

  // 1. Completions per day (Bar Chart)
  const completionsPerDay = last30Days.map(date => {
    const count = logs.filter(log => log.date === date).length;
    return {
      date: format(parseISO(date), 'MMM dd'),
      completions: count,
      points: count * 10 // 10 points per completion
    };
  });

  // 2. Cumulative Points over time (Area Chart)
  let cumulativePoints = Math.max(0, (profile?.points || 0) - (logs.length * 10)); // Approximate starting points 30 days ago
  const pointsOverTime = completionsPerDay.map(day => {
    cumulativePoints += day.points;
    return {
      date: day.date,
      totalPoints: cumulativePoints
    };
  });

  // 3. Habit Completion Rates (Bar Chart)
  const habitCompletionRates = habits.map(habit => {
    const completions = logs.filter(log => log.habitId === habit.id).length;
    return {
      name: habit.title.length > 15 ? habit.title.substring(0, 15) + '...' : habit.title,
      completions
    };
  }).sort((a, b) => b.completions - a.completions);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-xl leading-tight">Your Progress</h1>
            <p className="text-xs text-zinc-400">Track your journey and achievements</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">30-Day Completions</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Active Habits</p>
              <p className="text-2xl font-bold">{habits.length}</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Avg. Daily Habits</p>
              <p className="text-2xl font-bold">{(logs.length / 30).toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Daily Completions Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              Daily Habit Completions (Last 30 Days)
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#27272a' }}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                    itemStyle={{ color: 'var(--color-primary-500)' }}
                  />
                  <Bar dataKey="completions" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} name="Habits Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Points Accumulation Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              Points Accumulation
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pointsOverTime} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                    itemStyle={{ color: '#06b6d4' }}
                  />
                  <Area type="monotone" dataKey="totalPoints" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorPoints)" name="Total Points" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Habit Completion Rates */}
          {habitCompletionRates.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Most Completed Habits (Last 30 Days)
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitCompletionRates} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="#71717a" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#a1a1aa" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{ fill: '#27272a' }}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Bar dataKey="completions" fill="#a855f7" radius={[0, 4, 4, 0]} name="Completions" barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
