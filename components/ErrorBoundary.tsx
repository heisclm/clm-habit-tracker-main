'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected system failure has occurred.';
      
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = `Neural Link Error: ${parsed.error}`;
          }
        }
      } catch {
        // Not a JSON error, use default or raw message
        if (this.state.error?.message && !this.state.error.message.includes('{')) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900/40 backdrop-blur-xl border border-red-500/20 rounded-[2.5rem] p-8 text-center space-y-6 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-[scan_2s_linear_infinite]" />
            
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">System Breach Detected</h2>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-tighter italic text-sm transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                <RefreshCcw className="w-4 h-4" />
                Reboot Interface
              </button>
            </div>

            <div className="pt-2">
              <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.3em]">
                Error_Code: 0x80041001 // Neural_Link_v2.4
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
