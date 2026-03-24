'use client';

import { useState } from 'react';
import { Award, X, Star, Flame, Zap, Crown, Target, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { useAuth } from '@/components/AuthProvider';

const iconMap: Record<string, React.ElementType> = {
  Star, Flame, Zap, Crown, Target, Award, Trophy, TrendingUp, Sparkles
};

export function AchievementsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();
  
  const unlockedSet = new Set(profile?.unlockedAchievements || []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-zinc-800 transition-colors group"
      >
        <Award className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-bold">{unlockedSet.size}</span>
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Badges</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="font-bold flex items-center gap-2 text-purple-400">
                <Award className="w-5 h-5" />
                Achievements & Badges
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = unlockedSet.has(achievement.id);
                  const IconComponent = iconMap[achievement.icon] || Award;
                  
                  return (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${
                        isUnlocked 
                          ? 'bg-purple-950/20 border-purple-900/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                          : 'bg-zinc-950/50 border-zinc-800/50 opacity-60 grayscale'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isUnlocked ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${isUnlocked ? 'text-zinc-100' : 'text-zinc-400'}`}>
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
