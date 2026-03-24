'use client';

import { motion } from 'motion/react';
import { useAuth } from '@/components/AuthProvider';
import { User, Shield, Zap, Crown } from 'lucide-react';

export function PlayerCard() {
  const { user, profile } = useAuth();

  const level = profile?.level || 1;
  const points = profile?.points || 0;
  const xpInLevel = points % 100;
  const progress = xpInLevel; // Assuming 100 XP per level for simplicity

  const getRankTitle = (lvl: number) => {
    if (lvl < 5) return 'Novice Tracker';
    if (lvl < 10) return 'Consistency Knight';
    if (lvl < 20) return 'Habit Hero';
    if (lvl < 50) return 'Legendary Achiever';
    return 'Ascended Master';
  };

  const rankTitle = getRankTitle(level);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 overflow-hidden shadow-2xl group"
    >
      {/* Neon Glow Accents */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/20 rounded-full blur-[80px] group-hover:bg-violet-600/30 transition-colors duration-700" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-600/20 rounded-full blur-[80px] group-hover:bg-cyan-600/30 transition-colors duration-700" />

      <div className="relative flex flex-col md:flex-row items-center gap-6">
        {/* Avatar Section */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 rounded-full blur opacity-40 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-zinc-900 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
            {profile?.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt={user?.displayName || 'Player'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-zinc-700" />
            )}
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-[10px] font-black px-2 py-1 rounded-lg border border-white/20 shadow-lg uppercase tracking-tighter italic"
          >
            Lv. {level}
          </motion.div>
        </div>

        {/* Info Section */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-[0.3em] font-bold">
                  {rankTitle}
                </span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                {user?.displayName || 'Operator'}
              </h2>
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>Def: 99</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-violet-400" />
                <span>Atk: 124</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Experience Points</span>
              <span className="text-[10px] font-mono text-violet-400 font-bold">{xpInLevel} / 100 XP</span>
            </div>
            <div className="relative h-3 w-full bg-zinc-900/80 rounded-full border border-white/5 overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 rounded-full relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
