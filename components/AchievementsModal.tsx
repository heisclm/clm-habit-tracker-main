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
        className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center group hover:border-white/10 transition-all relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10 rounded-tl-2xl"></div>
        <Award className="w-5 h-5 text-violet-500 mb-3 group-hover:scale-110 transition-transform" />
        <span className="text-3xl font-black tracking-tighter text-white">{unlockedSet.size}</span>
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-1">Trophies</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(139,92,246,0.1)] w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
            {/* Cyber Accents */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-violet-500/30 rounded-tl-[3rem] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-violet-500/30 rounded-br-[3rem] pointer-events-none"></div>

            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 relative">
              <div className="space-y-1">
                <h3 className="font-black text-2xl uppercase tracking-tighter text-white italic flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-violet-500" />
                  Trophy Room
                </h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Neural Achievement Protocol</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = unlockedSet.has(achievement.id);
                  const IconComponent = iconMap[achievement.icon] || Award;
                  
                  return (
                    <div 
                      key={achievement.id}
                      className="group relative flex flex-col items-center text-center gap-4"
                    >
                      <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                        isUnlocked 
                          ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-[0_0_30px_rgba(139,92,246,0.2)] scale-100' 
                          : 'bg-zinc-900/40 text-zinc-700 border border-white/5 grayscale scale-95 opacity-50'
                      }`}>
                        {isUnlocked && (
                          <div className="absolute inset-0 bg-violet-500/10 rounded-3xl animate-pulse blur-xl" />
                        )}
                        <IconComponent className={`w-10 h-10 relative z-10 ${isUnlocked ? 'animate-in zoom-in duration-700' : ''}`} />
                        
                        {!isUnlocked && (
                          <div className="absolute -top-1 -right-1 bg-zinc-800 p-1.5 rounded-lg border border-white/10">
                            <X className="w-3 h-3 text-zinc-600" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h4 className={`text-[10px] font-black uppercase tracking-widest italic leading-tight ${isUnlocked ? 'text-white' : 'text-zinc-600'}`}>
                          {achievement.title}
                        </h4>
                        {isUnlocked && (
                          <div className="h-0.5 w-4 bg-violet-500/50 mx-auto rounded-full" />
                        )}
                      </div>

                      {/* Tooltip on Hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 p-2 bg-black border border-white/10 rounded-lg text-[9px] font-mono text-zinc-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                        {achievement.description}
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
