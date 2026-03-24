'use client';

import { useState, useRef } from 'react';
import { Share2, X, Download, Copy, Check, Trophy, Flame, Star } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import * as htmlToImage from 'html-to-image';

export function ShareModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, profile } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  if (!user || !profile) return null;

  const shareText = `I'm on a 🔥 ${profile.currentStreak}-day streak and reached Level ${profile.level} in my habit tracker! #HabitTracker #LevelUp`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const generateImage = async () => {
    if (!cardRef.current) return null;
    try {
      setIsGenerating(true);
      // We use a slightly larger scale for better quality
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      return dataUrl;
    } catch (err) {
      console.error('Failed to generate image', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `habit-stats-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleNativeShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      // Convert base64 to blob for sharing
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'habit-stats.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Habit Stats',
          text: shareText,
          files: [file]
        });
      } else if (navigator.share) {
        // Fallback to text only if file sharing is not supported
        await navigator.share({
          title: 'My Habit Stats',
          text: shareText,
        });
      } else {
        // Fallback to download if web share API is completely unavailable
        handleDownload();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-400 hover:text-primary-400 transition-colors bg-zinc-950 hover:bg-zinc-800 rounded-xl border border-zinc-800 flex items-center gap-2 text-sm font-medium"
        title="Share Progress"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="font-bold flex items-center gap-2 text-primary-400">
                <Share2 className="w-5 h-5" />
                Share Your Progress
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* The Shareable Card Preview */}
              <div className="flex justify-center">
                <div 
                  ref={cardRef}
                  className="w-[320px] h-[320px] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl"
                >
                  {/* Decorative background elements */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-cyan-500"></div>
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

                  <div className="z-10 space-y-6 w-full">
                    <div>
                      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200 tracking-tight">
                        {user.displayName || 'Hero'}
                      </h2>
                      <p className="text-sm text-zinc-400 font-medium uppercase tracking-widest mt-1">
                        Level {profile.level} Achiever
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 flex flex-col items-center">
                        <Flame className="w-6 h-6 text-orange-500 mb-1" />
                        <span className="text-xl font-bold text-zinc-100">{profile.currentStreak}</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Day Streak</span>
                      </div>
                      <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 flex flex-col items-center">
                        <Trophy className="w-6 h-6 text-yellow-500 mb-1" />
                        <span className="text-xl font-bold text-zinc-100">{profile.points}</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Points</span>
                      </div>
                      <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 flex flex-col items-center col-span-2">
                        <Star className="w-6 h-6 text-cyan-500 mb-1" />
                        <span className="text-xl font-bold text-zinc-100">{profile.totalHabitsCompleted || 0}</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Habits Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Preview */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 italic">
                &quot;{shareText}&quot;
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleNativeShare}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
