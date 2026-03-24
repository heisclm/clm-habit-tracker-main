'use client';

import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Circle, Trash2, Flame, Zap, Target, Award } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { format } from 'date-fns';
import { ReminderButton } from '@/components/ReminderButton';
import { useState, useRef } from 'react';

export function QuestList() {
  const { habits, logs, loading, toggleHabit, deleteHabit } = useHabits();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [floatingXP, setFloatingXP] = useState<{ id: string; x: number; y: number }[]>([]);
  const idCounter = useRef(0);

  const handleToggle = async (habitId: string, e: React.MouseEvent) => {
    const isCompletedBefore = logs.some(log => log.habitId === habitId && log.date === today);
    
    if (!isCompletedBefore) {
      // Show floating XP
      idCounter.current += 1;
      const newXP = { id: idCounter.current.toString(), x: e.clientX, y: e.clientY };
      setFloatingXP(prev => [...prev, newXP]);
      setTimeout(() => setFloatingXP(prev => prev.filter(xp => xp.id !== newXP.id)), 1000);
    }

    await toggleHabit(habitId);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-zinc-600 font-mono text-xs animate-pulse">
        Scanning neural pathways...
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/20 border border-white/5 border-dashed rounded-3xl">
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No active protocols detected.</p>
        <p className="text-zinc-700 text-[10px] mt-2 italic">Initialize your first habit to begin advancement.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <AnimatePresence>
        {habits.map((habit, index) => {
          const isCompleted = logs.some(log => log.habitId === habit.id && log.date === today);
          const streak = habit.streak || 0;

          return (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 20,
                delay: index * 0.05 
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${
                isCompleted 
                  ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                  : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
              }`}
            >
              {/* Card Accents */}
              {isCompleted && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              )}

              <div className="flex items-center gap-5 flex-1 text-left">
                <button
                  onClick={(e) => handleToggle(habit.id!, e)}
                  className={`relative w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                      : 'border-white/10 group-hover:border-white/30 text-transparent'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-black transition-all tracking-tight uppercase italic ${
                      isCompleted ? 'text-emerald-400 line-through opacity-60' : 'text-white'
                    }`}>
                      {habit.title}
                    </h3>
                    {streak > 0 && (
                      <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-orange-500 font-bold">{streak}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-zinc-600" />
                      <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Quest: Daily</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-violet-500" />
                      <span className="text-[9px] font-mono text-violet-500 uppercase tracking-widest">+50 XP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <ReminderButton habit={habit} />
                <button
                  onClick={() => deleteHabit(habit.id!)}
                  className="p-2.5 text-zinc-600 hover:text-red-500 transition-all bg-white/5 rounded-lg border border-white/5"
                  title="Purge protocol"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Floating XP Text */}
      <AnimatePresence>
        {floatingXP.map(xp => (
          <motion.div
            key={xp.id}
            initial={{ opacity: 0, y: xp.y, x: xp.x - 20 }}
            animate={{ opacity: 1, y: xp.y - 100, x: xp.x - 20 }}
            exit={{ opacity: 0 }}
            className="fixed z-[100] pointer-events-none text-emerald-400 font-black text-xl italic tracking-tighter"
          >
            +50 XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
