'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Settings, X, Palette, Type } from 'lucide-react';

const THEMES = [
  { id: 'emerald', name: 'Emerald', colorClass: 'bg-emerald-500' },
  { id: 'violet', name: 'Violet', colorClass: 'bg-violet-500' },
  { id: 'rose', name: 'Rose', colorClass: 'bg-rose-500' },
  { id: 'blue', name: 'Blue', colorClass: 'bg-blue-500' },
  { id: 'amber', name: 'Amber', colorClass: 'bg-amber-500' },
];

const FONTS = [
  { id: 'inter', name: 'Inter (Default)', class: 'font-inter' },
  { id: 'space', name: 'Space Grotesk', class: 'font-space' },
  { id: 'playfair', name: 'Playfair Display', class: 'font-playfair' },
  { id: 'mono', name: 'JetBrains Mono', class: 'font-mono' },
];

export function SettingsModal() {
  const { profile, updateProfileSettings } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentTheme = profile?.themeColor || 'emerald';
  const currentFont = profile?.fontFamily || 'inter';

  const handleThemeChange = async (themeId: string) => {
    setIsSaving(true);
    await updateProfileSettings({ themeColor: themeId });
    setIsSaving(false);
  };

  const handleFontChange = async (fontId: string) => {
    setIsSaving(true);
    await updateProfileSettings({ fontFamily: fontId });
    setIsSaving(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-400 hover:text-primary-400 transition-colors bg-zinc-950 hover:bg-zinc-800 rounded-xl border border-zinc-800 flex items-center gap-2 text-sm font-medium"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Settings</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-500" />
                App Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Theme Colors */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Theme Color
                </h3>
                <div className="flex flex-wrap gap-3">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      disabled={isSaving}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${theme.colorClass} ${
                        currentTheme === theme.id
                          ? 'ring-4 ring-zinc-900 ring-offset-2 ring-offset-zinc-400 scale-110'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      title={theme.name}
                    >
                      {currentTheme === theme.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fonts */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Font Family
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => handleFontChange(font.id)}
                      disabled={isSaving}
                      className={`p-3 rounded-xl border text-left transition-all ${font.class} ${
                        currentFont === font.id
                          ? 'bg-primary-500/10 border-primary-500/50 text-primary-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
