'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Settings, X, Palette, User, Mail, Lock, Check, AlertCircle, Camera, Trash2 } from 'lucide-react';

const THEMES = [
  { id: 'emerald', name: 'Emerald', colorClass: 'bg-emerald-500' },
  { id: 'violet', name: 'Violet', colorClass: 'bg-violet-500' },
  { id: 'rose', name: 'Rose', colorClass: 'bg-rose-500' },
  { id: 'blue', name: 'Blue', colorClass: 'bg-blue-500' },
  { id: 'amber', name: 'Amber', colorClass: 'bg-amber-500' },
];

export function SettingsModal() {
  const { profile, updateProfileSettings, updateEmailAuth, updatePasswordAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoURL, setPhotoURL] = useState('');

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
    } catch (err) {
      console.error(err);
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
        setError(err.message || 'Failed to update account.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 text-zinc-500 hover:text-white transition-all bg-black/40 hover:bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic active:scale-95 group"
      >
        <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
        <span className="hidden sm:inline">Settings</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500 relative max-h-[90vh] flex flex-col">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/10 rounded-tl-[2.5rem] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/10 rounded-br-[2.5rem] pointer-events-none"></div>

            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-xs font-black uppercase tracking-widest text-white italic flex items-center gap-2">
                  <Settings className="w-4 h-4 text-zinc-400" />
                  Settings
                </h2>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Customize your experience</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
              {/* Theme Colors */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" />
                  Theme Color
                </h3>
                <div className="flex flex-wrap gap-4">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      disabled={isSaving}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all relative group ${theme.colorClass} ${
                        currentTheme === theme.id
                          ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                          : 'hover:scale-105 opacity-40 hover:opacity-100'
                      }`}
                      title={theme.name}
                    >
                      {currentTheme === theme.id && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                      )}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        {theme.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Settings */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Account Settings
                </h3>

                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                      {photoURL ? (
                        <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-zinc-700" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    {photoURL && (
                      <button
                        onClick={() => setPhotoURL('')}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Profile Picture (Max 1MB)</p>
                </div>

                <form onSubmit={handleAccountUpdate} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-400 text-[10px] font-mono flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 bg-primary-950/30 border border-primary-500/30 rounded-xl text-primary-400 text-[10px] font-mono flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      {success}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-9 py-2.5 text-xs focus:outline-none focus:border-primary-500/50 transition-all text-white"
                          placeholder="Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 ml-1">Username</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-9 py-2.5 text-xs focus:outline-none focus:border-primary-500/50 transition-all text-white"
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-9 py-2.5 text-xs focus:outline-none focus:border-primary-500/50 transition-all text-white"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 ml-1">New Password (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-9 py-2.5 text-xs focus:outline-none focus:border-primary-500/50 transition-all text-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 rounded-xl font-black uppercase tracking-widest text-[10px] italic transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    {isSaving ? 'Updating...' : 'Save Account Changes'}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="px-8 py-3 bg-zinc-800 text-white hover:bg-zinc-700 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] italic active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
