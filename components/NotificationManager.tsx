'use client';

import { useEffect, useRef, useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { format } from 'date-fns';
import { BellRing, X } from 'lucide-react';

export function NotificationManager() {
  const { habits, logs } = useHabits();
  const notifiedHabitsRef = useRef<Set<string>>(new Set());
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [activeToasts, setActiveToasts] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const today = format(now, 'yyyy-MM-dd');

      habits.forEach(habit => {
        if (!habit.reminderTime || !habit.id) return;

        if (habit.reminderTime === currentTime) {
          const notificationKey = `${habit.id}-${today}`;
          if (notifiedHabitsRef.current.has(notificationKey)) return;

          const isCompleted = logs.some(log => log.habitId === habit.id && log.date === today);
          if (isCompleted) return;

          notifiedHabitsRef.current.add(notificationKey);

          // Try native notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('Habit Reminder', {
                body: `It's time for your habit: ${habit.title}`,
              });
            } catch (error) {
              console.error('Error triggering notification:', error);
            }
          }

          // Always show in-app toast as fallback/complement
          setActiveToasts(prev => [...prev, { id: habit.id!, title: habit.title }]);
          
          // Auto-remove toast after 15 seconds
          setTimeout(() => {
            setActiveToasts(prev => prev.filter(t => t.id !== habit.id));
          }, 15000);
        }
      });
    };

    checkReminders();
    const intervalId = setInterval(checkReminders, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [habits, logs, permission]);

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {activeToasts.map(toast => (
        <div key={toast.id} className="bg-zinc-900 border border-primary-500/50 shadow-2xl shadow-primary-900/20 rounded-xl p-4 flex items-start gap-3 w-80 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="bg-primary-500/20 p-2 rounded-lg text-primary-400">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-zinc-100">Habit Reminder</h4>
            <p className="text-sm text-zinc-400 mt-0.5">It's time for: <span className="text-primary-300 font-medium">{toast.title}</span></p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
