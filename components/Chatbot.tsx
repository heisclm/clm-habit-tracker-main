'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Hi! I'm your AI Habit Coach. How can I help you stay on track today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // Construct chat history for context
      const contents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: userText }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: "You are an enthusiastic and supportive habit coach. Keep your answers concise, motivating, and actionable. You help users build good habits, stay consistent, and overcome procrastination."
        }
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text as string }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Oops, I'm having trouble connecting right now. Let's try again later!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-500 hover:text-primary-400 transition-all flex flex-col items-center gap-1 group relative"
      >
        <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 absolute -top-10 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all shadow-2xl">AI Chat</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed bottom-28 left-4 right-4 sm:left-auto sm:right-8 sm:w-[400px] bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary-500/20 rounded-tl-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary-500/20 rounded-br-3xl pointer-events-none"></div>

          <div className="p-5 bg-white/5 border-b border-white/5 flex justify-between items-center relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary-500 blur-sm animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-black text-xs uppercase tracking-widest text-white italic">AI Habit Coach</h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Active Support</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto max-h-[450px] min-h-[350px] space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white text-black font-bold rounded-br-none shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                    : 'bg-zinc-900/60 border border-white/5 text-zinc-200 rounded-bl-none'
                }`}>
                  {msg.role === 'model' && (
                    <div className="text-[9px] font-mono text-primary-500 uppercase tracking-widest mb-2 opacity-70">AI Response:</div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5 flex gap-3">
            <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your coach..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all placeholder:text-zinc-700"
                />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-800 uppercase tracking-widest pointer-events-none">_CMD</div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-white text-black hover:bg-zinc-200 disabled:opacity-30 rounded-xl px-4 py-3 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>,
        document.body
      )}
    </>
  );
}
