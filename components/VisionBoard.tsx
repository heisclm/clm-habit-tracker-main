'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, X, Loader2, Wand2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Image from 'next/image';

export function VisionBoard() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            { text: `A highly motivational, aesthetic, inspiring vision board image representing: ${prompt}. High quality, cinematic lighting, inspiring.` }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        setError("Couldn't generate an image. Please try a different prompt.");
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-500 hover:text-cyan-400 transition-all flex flex-col items-center gap-1 group relative"
      >
        <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 absolute -top-10 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all shadow-2xl">Vision Board</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-[2.5rem] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-500/20 rounded-br-[2.5rem] pointer-events-none"></div>

            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="space-y-0.5">
                <h3 className="font-black text-xs uppercase tracking-widest text-white italic flex items-center gap-2">
                  <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                  Vision Board
                </h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Goal Visualization</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-2 text-center">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] leading-relaxed">
                  Visualize your goals. Describe your ideal future to stay motivated.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your vision..."
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-700"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-800 uppercase tracking-widest pointer-events-none">_PROMPT</div>
                </div>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-30 rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Manifesting_
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Vision
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-400 text-[10px] font-mono uppercase tracking-widest text-center w-full animate-in shake duration-500">
                  [ERROR]: {error}
                </div>
              )}

              {imageUrl && !isLoading && (
                <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-700">
                  <Image 
                    src={imageUrl} 
                    alt="Generated Vision Board" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-mono text-white/50 uppercase tracking-widest">Neural_Output_01</p>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest italic truncate max-w-[200px]">{prompt}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
