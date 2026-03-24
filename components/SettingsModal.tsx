'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Settings, X, Palette, User, Mail, Lock, Check, AlertCircle, Camera, Trash2, Save, Shield, Cpu, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

const THEMES = [
  { id: 'emerald', name: 'Emerald', colorClass: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
  { id: 'violet', name: 'Violet', colorClass: 'bg-violet-500', glow: 'shadow-violet-500/20' },
  { id: 'rose', name: 'Rose', colorClass: 'bg-rose-500', glow: 'shadow-rose-500/20' },
  { id: 'blue', name: 'Blue', colorClass: 'bg-blue-500', glow: 'shadow-blue-500/20' },
  { id: 'amber', name: 'Amber', colorClass: 'bg-amber-500', glow: 'shadow-amber-500/20' },
];

type Tab = 'visuals' | 'identity' | 'security';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { profile, updateProfileSettings, updateEmailAuth, updatePasswordAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('visuals');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (profile) {
      setName(profile.displayName || '');
      setUsername(profile.username || '');
      setEmail(profile.email || '');
      setPhotoURL(profile.photoURL || '');
    }
  }, [profile, isOpen]);

  const currentTheme = profile?.themeColor || 'emerald';

  const handleThemeChange = async (themeId: string) => {
    setIsSaving(true);
    try {
      await updateProfileSettings({ themeColor: themeId });
    } catch (err: any) {
      console.error(err);
      try {
        const parsedError = JSON.parse(err.message);
        let friendlyMessage = parsedError.error;
        if (friendlyMessage === 'MISSING OR INSUFFICIENT PERMISSIONS.') {
          friendlyMessage = 'Access Denied: You do not have permission to modify this record.';
        }
        setError(`System Error: ${friendlyMessage}`);
      } catch {
        setError(err.message || 'Failed to update theme.');
      }
    }
    setIsSaving(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError('Image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Update Name, Username, and PhotoURL
      if (name !== profile?.displayName || username !== profile?.username || photoURL !== profile?.photoURL) {
        await updateProfileSettings({ displayName: name, username, photoURL });
      }

      // Update Email if changed
      if (email !== profile?.email) {
        await updateEmailAuth(email);
        setSuccess('Verification email sent to new address.');
      }

      // Update Password if provided
      if (password) {
        await updatePasswordAuth(password);
        setPassword('');
        setSuccess('Password updated successfully.');
      }

      if (!success) setSuccess('Account updated successfully.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Please sign out and sign back in to change sensitive info.');
      } else {
        try {
          const parsedError = JSON.parse(err.message);
          let friendlyMessage = parsedError.error;
          if (friendlyMessage === 'MISSING OR INSUFFICIENT PERMISSIONS.') {
            friendlyMessage = 'Access Denied: You do not have permission to modify this record.';
          }
          setError(`System Error: ${friendlyMessage}`);
        } catch {
          setError(err.message || 'Failed to update account.');
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,1)] w-full max-w-3xl overflow-hidden relative z-10 max-h-[85vh] flex flex-col"
          >
            {/* Scanning Line Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent animate-[scan_3s_linear_infinite] pointer-events-none z-20" />

            {/* Scanning Overlay */}
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-zinc-950 z-30 flex flex-col items-center justify-center gap-4"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-2 border-violet-500/20 rounded-full animate-ping" />
                    <Cpu className="w-10 h-10 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-[10px] font-mono text-violet-400 uppercase tracking-[0.5em] animate-pulse">Initializing System Config</p>
                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="h-full bg-violet-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-violet-500/20 rounded-xl border border-violet-500/30">
                  <Monitor className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic text-white leading-none">System Configuration</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Neural Link Active // v2.4.0-STABLE</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-48 border-r border-white/5 bg-black/20 p-4 space-y-2 shrink-0 hidden sm:block">
                {[
                  { id: 'visuals', label: 'Visuals', icon: Palette, color: 'text-cyan-400' },
                  { id: 'identity', label: 'Identity', icon: User, color: 'text-violet-400' },
                  { id: 'security', label: 'Security', icon: Shield, color: 'text-rose-400' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative ${
                      activeTab === tab.id 
                        ? 'bg-white/10 text-white' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute left-0 w-1 h-6 bg-violet-500 rounded-full"
                      />
                    )}
                  </button>
                ))}
                
                {/* System Stats Decor */}
                <div className="mt-auto p-4 space-y-3 border-t border-white/5 pt-6">
                  <div className="space-y-1">
                    <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Neural Sync</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[98%] bg-emerald-500/50" />
                      </div>
                      <span className="text-[8px] font-mono text-emerald-500">98%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Uptime</p>
                    <p className="text-[8px] font-mono text-white">12:44:02:11</p>
                  </div>
                </div>
              </div>

              {/* Mobile Tabs */}
              <div className="sm:hidden flex border-b border-white/5 bg-black/20 p-2 gap-2 shrink-0">
                {['visuals', 'identity', 'security'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as Tab)}
                    className={`flex-1 py-2 rounded-xl text-[9px] font-mono uppercase tracking-widest ${
                      activeTab === tab ? 'bg-white/10 text-white' : 'text-zinc-500'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'visuals' && (
                    <motion.section
                      key="visuals"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-8"
                    >
                      <div className="space-y-2">
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tight">Neural Interface Theme</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Select your primary visual frequency</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            disabled={isSaving}
                            className={`p-4 rounded-3xl border transition-all relative group flex flex-col items-center gap-3 ${
                              currentTheme === theme.id
                                ? `bg-white/5 border-white/20 shadow-lg ${theme.glow}`
                                : 'bg-black/20 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-2xl ${theme.colorClass} ${currentTheme === theme.id ? 'scale-110' : 'opacity-50 group-hover:opacity-100'} transition-all shadow-inner flex items-center justify-center`}>
                              {currentTheme === theme.id && <Check className="w-5 h-5 text-white" />}
                            </div>
                            <span className={`text-[10px] font-mono uppercase tracking-widest ${currentTheme === theme.id ? 'text-white font-bold' : 'text-zinc-600'}`}>
                              {theme.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {activeTab === 'identity' && (
                    <motion.section
                      key="identity"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-8"
                    >
                      <div className="space-y-2">
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tight">Operator Identity</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Manage your public profile and avatar</p>
                      </div>

                      {/* Avatar Section */}
                      <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-white/5 rounded-[2rem] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-3xl" />
                        
                        <div className="relative group">
                          <div className="w-28 h-28 rounded-full bg-zinc-900 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative">
                            {photoURL ? (
                              <Image 
                                src={photoURL} 
                                alt="Profile" 
                                fill 
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User className="w-10 h-10 text-zinc-700" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 p-2.5 bg-violet-600 text-white rounded-xl shadow-xl hover:bg-violet-500 transition-all border border-white/20 active:scale-90"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex-1 space-y-4 text-center sm:text-left">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white uppercase tracking-tight">Neural Avatar</p>
                            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Max size: 1.0 MB // PNG, JPG, WEBP</p>
                          </div>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-mono text-white uppercase tracking-widest transition-all"
                            >
                              Upload New
                            </button>
                            {photoURL && (
                              <button 
                                onClick={() => setPhotoURL('')}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[9px] font-mono text-red-400 uppercase tracking-widest transition-all"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 ml-1">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-white font-mono"
                              placeholder="Identity Name"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 ml-1">Alias (Username)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600">@</span>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-white font-mono"
                              placeholder="alias"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.section>
                  )}

                  {activeTab === 'security' && (
                    <motion.section
                      key="security"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-8"
                    >
                      <div className="space-y-2">
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tight">Security Protocols</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Update your access keys and neural address</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 ml-1">Neural Address (Email)</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-white font-mono"
                              placeholder="neural@interface.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 ml-1">Access Key (Password)</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-white font-mono"
                              placeholder="Leave blank to keep current"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Status Bar / Footer */}
            <div className="p-6 border-t border-white/5 bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-red-400 text-[9px] font-mono uppercase tracking-widest"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-emerald-400 text-[9px] font-mono uppercase tracking-widest"
                    >
                      <Check className="w-3 h-3" />
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-2xl transition-all font-mono uppercase tracking-widest text-[9px] border border-white/5"
                >
                  Abort
                </button>
                <button
                  onClick={handleAccountUpdate}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-8 py-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 rounded-2xl font-black uppercase tracking-tighter text-xs italic transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {isSaving ? 'Syncing...' : 'Commit Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
