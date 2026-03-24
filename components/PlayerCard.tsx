'use client';

import { motion } from 'motion/react';
import { useAuth } from '@/components/AuthProvider';
import { User, Shield, Zap, Crown, Settings as SettingsIcon } from 'lucide-react';
import Image from 'next/image';

interface PlayerCardProps {
  onOpenSettings?: () => void;
}

export function PlayerCard({ onOpenSettings }: PlayerCardProps) {
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
      className="relative w-full bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl group"
    >
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-violet-500/20 rounded-tl-[2.5rem] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-500/20 rounded-br-[2.5rem] pointer-events-none" />

      {/* Neon Glow Accents */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] group-hover:bg-violet-600/20 transition-colors duration-700" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px] group-hover:bg-cyan-600/20 transition-colors duration-700" />

      <div className="relative flex flex-col md:flex-row items-center gap-8">
        {/* Avatar Section */}
        <div className="relative shrink-0">
          <div className="absolute -inset-2 bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity animate-pulse" />
          <div className="relative w-32 h-32 rounded-full bg-zinc-900 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
            {profile?.photoURL ? (
              <Image 
                src={profile.photoURL} 
                alt={user?.displayName || 'Player'} 
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-12 h-12 text-zinc-700" />
            )}
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/20 shadow-xl uppercase tracking-tighter italic"
          >
            Lv. {level}
          </motion.div>
        </div>

        {/* Info Section */}
        <div className="flex-1 w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-[0.3em] font-bold">
                  {rankTitle}
                </span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                {user?.displayName || 'Operator'}
              </h2>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">@{profile?.username || 'unknown_alias'}</p>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center justify-center gap-6 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] font-mono text-white font-bold">99</span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Def</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-violet-400" />
                    <span className="text-[10px] font-mono text-white font-bold">124</span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Atk</span>
                </div>
              </div>

              <button 
                onClick={onOpenSettings}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group/settings"
                title="System Configuration"
              >
                <SettingsIcon className="w-5 h-5 text-zinc-400 group-hover/settings:text-violet-400 group-hover/settings:rotate-90 transition-all duration-500" />
              </button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Neural Sync Progress</span>
              </div>
              <span className="text-[10px] font-mono text-violet-400 font-bold">{xpInLevel} / 100 XP</span>
            </div>
            <div className="relative h-4 w-full bg-zinc-900/80 rounded-full border border-white/5 overflow-hidden p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 rounded-full relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                {/* Glow effect on the tip */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-md opacity-50" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
