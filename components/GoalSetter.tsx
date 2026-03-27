'use client';

import { useState } from 'react';
import { Target, Sparkles, X, Loader2, CheckSquare, Square } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { useHabits } from '@/hooks/useHabits';

export function GoalSetter() {
  const [isOpen, setIsOpen] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedHabits, setSuggestedHabits] = useState<string[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { addHabit } = useHabits();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setSuggestedHabits([]);
    setSelectedHabits(new Set());

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `I want to achieve this long-term goal: "${goalInput}". Break this down into 3 to 5 highly actionable, specific, and manageable daily habits that I can track every day.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: "A specific, actionable daily habit (e.g., 'Read 10 pages', 'Drink 2L of water')"
            },
            description: "List of daily habits"
          }
        }
      });

      if (response.text) {
        const habits: string[] = JSON.parse(response.text);
        setSuggestedHabits(habits);
        // Auto-select all by default
        setSelectedHabits(new Set(habits));
      } else {
        setError("Couldn't generate habits. Please try again.");
      }
    } catch (err) {
      console.error('Goal breakdown error:', err);
      setError("Failed to generate habits. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelection = (habit: string) => {
    const newSelection = new Set(selectedHabits);
    if (newSelection.has(habit)) {
      newSelection.delete(habit);
    } else {
      newSelection.add(habit);
    }
    setSelectedHabits(newSelection);
  };

  const handleAddSelected = async () => {
    if (selectedHabits.size === 0 || isAdding) return;
    setIsAdding(true);
    
    try {
      // Add all selected habits
      const promises = Array.from(selectedHabits).map(habit => addHabit(habit, `Generated from goal: ${goalInput}`));
      await Promise.all(promises);
      
      // Reset and close
      setIsOpen(false);
      setGoalInput('');
      setSuggestedHabits([]);
      setSelectedHabits(new Set());
    } catch (err) {
      console.error('Error adding habits:', err);
      setError("Failed to add some habits. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-cyan-500/50 text-cyan-400 rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 group"
        title="AI Goal Breakdown"
      >
        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
        <span className="hidden sm:inline font-medium text-sm">AI Goal Setup</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="font-bold flex items-center gap-2 text-cyan-400">
                <Target className="w-5 h-5" />
                AI Goal Breakdown
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">What is your long-term goal?</label>
                <form onSubmit={handleGenerate} className="flex gap-2">
                  <input
                    type="text"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="e.g., Run a marathon, Learn Spanish..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!goalInput.trim() || isGenerating}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                  </button>
                </form>
              </div>

              {error && (
                <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {suggestedHabits.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-zinc-300">Suggested Daily Habits</h4>
                    <p className="text-xs text-zinc-500">Select the ones you want to track.</p>
                  </div>
                  
                  <div className="space-y-2">
                    {suggestedHabits.map((habit, idx) => {
                      const isSelected = selectedHabits.has(habit);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleSelection(habit)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                            isSelected 
                              ? 'bg-cyan-950/20 border-cyan-900/50 text-zinc-100' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-cyan-500" />
                            ) : (
                              <Square className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>
                          <span className="text-sm leading-relaxed">{habit}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleAddSelected}
                    disabled={selectedHabits.size === 0 || isAdding}
                    className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding Habits...
                      </>
                    ) : (
                      `Add ${selectedHabits.size} Habit${selectedHabits.size !== 1 ? 's' : ''}`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
