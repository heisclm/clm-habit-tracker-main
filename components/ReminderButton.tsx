'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, BellRing, X, Check } from 'lucide-react';
import { Habit } from '@/lib/models';
import { useHabits } from '@/hooks/useHabits';

export function ReminderButton({ habit }: { habit: Habit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState(habit.reminderTime || '');
  const { updateHabit } = useHabits();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSave = async () => {
    if (habit.id) {
      await updateHabit(habit.id, { reminderTime: time || undefined });
    }
    setIsOpen(false);
  };

  const handleClear = async () => {
    setTime('');
    if (habit.id) {
      await updateHabit(habit.id, { reminderTime: undefined });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          habit.reminderTime 
            ? 'text-primary-400 bg-primary-950/30 hover:bg-primary-900/50' 
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
        }`}
        title={habit.reminderTime ? `Reminder set for ${habit.reminderTime}` : 'Set reminder'}
      >
        {habit.reminderTime ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm">Set Reminder</h4>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Time</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                className="flex-1 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3" /> Save
              </button>
              {habit.reminderTime && (
                <button 
                  onClick={handleClear}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
