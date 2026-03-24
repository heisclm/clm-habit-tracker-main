import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
        <AlertTriangle className="w-20 h-20 text-red-500 relative z-10" />
      </div>
      
      <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic mb-4">
        404: Protocol Error
      </h1>
      
      <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.3em] mb-8 max-w-md">
        The requested neural pathway does not exist in the current system matrix.
      </p>
      
      <Link 
        href="/"
        className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-tighter italic hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
      >
        <Home className="w-5 h-5" />
        Return to Base
      </Link>
    </div>
  );
}
