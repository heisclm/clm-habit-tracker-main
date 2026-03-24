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
        className="p-2 text-zinc-400 hover:text-cyan-400 transition-colors flex flex-col items-center gap-1 group relative"
      >
        <ImageIcon className="w-5 h-5" />
        <span className="text-[10px] font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 absolute -top-8 bg-zinc-800 px-2 py-1 rounded whitespace-nowrap">Vision Board</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="font-bold flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-cyan-400" />
                AI Vision Board
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-zinc-400 text-center">
                Visualize your goals. Describe your ideal future or the reward you&apos;re working towards.
              </p>

              <form onSubmit={handleGenerate} className="space-y-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A peaceful cabin in the mountains..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Manifesting...
                    </>
                  ) : (
                    'Generate Vision'
                  )}
                </button>
              </form>

              {error && (
                <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {imageUrl && !isLoading && (
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-zinc-800 shadow-inner">
                  <Image 
                    src={imageUrl} 
                    alt="Generated Vision Board" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
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
