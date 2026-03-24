'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mic, MicOff, Loader2, X } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export function VoiceCoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Audio playback queue
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  const cleanupAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {}
      sessionRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsRecording(false);
    setIsConnecting(false);
  };

  useEffect(() => {
    return () => cleanupAudio();
  }, []);

  const playNextAudio = () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }
    
    isPlayingRef.current = true;
    const buffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      playNextAudio();
    };
    source.start();
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const toggleRecording = async () => {
    if (isRecording) {
      cleanupAudio();
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
      } });
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsRecording(true);
            
            processorRef.current!.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert Float32Array to Int16Array
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              
              // Convert Int16Array to Base64
              const buffer = new ArrayBuffer(pcmData.length * 2);
              const view = new DataView(buffer);
              for (let i = 0; i < pcmData.length; i++) {
                view.setInt16(i * 2, pcmData[i], true); // true for little-endian
              }
              
              const bytes = new Uint8Array(buffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64Data = window.btoa(binary);

              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }
            
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const arrayBuffer = base64ToArrayBuffer(base64Audio);
              // The model returns PCM audio at 24000Hz
              try {
                // We need to decode the raw PCM. 
                // Since decodeAudioData expects a file format (WAV/MP3), and the model returns raw PCM,
                // we have to manually create an AudioBuffer.
                const int16Array = new Int16Array(arrayBuffer);
                const float32Array = new Float32Array(int16Array.length);
                for (let i = 0; i < int16Array.length; i++) {
                  float32Array[i] = int16Array[i] / 0x7FFF;
                }
                
                const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
                audioBuffer.getChannelData(0).set(float32Array);
                
                audioQueueRef.current.push(audioBuffer);
                if (!isPlayingRef.current) {
                  playNextAudio();
                }
              } catch (e) {
                console.error("Audio decode error", e);
              }
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please try again.");
            cleanupAudio();
          },
          onclose: () => {
            cleanupAudio();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are an energetic, supportive voice coach for a habit tracking app. Keep responses short (1-2 sentences). Encourage the user to complete their habits today.",
        },
      });
      
      sessionRef.current = await sessionPromise;
      
    } catch (err) {
      console.error('Failed to start voice coach:', err);
      setError("Failed to access microphone or connect to AI.");
      cleanupAudio();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-500 hover:text-orange-400 transition-all flex flex-col items-center gap-1 group relative"
      >
        <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 absolute -top-10 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all shadow-2xl">Voice Coach</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-500 relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-orange-500/20 rounded-tl-[2.5rem] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-orange-500/20 rounded-br-[2.5rem] pointer-events-none"></div>

            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="space-y-0.5">
                <h3 className="font-black text-xs uppercase tracking-widest text-white italic flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-orange-500" />
                  Voice Coach
                </h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Live Coaching</p>
              </div>
              <button 
                onClick={() => { setIsOpen(false); cleanupAudio(); }} 
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-10 flex flex-col items-center justify-center space-y-8">
              <div className="relative group">
                {/* Animated Rings */}
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping scale-150 opacity-20" />
                    <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-pulse scale-125" />
                  </>
                )}
                
                <button
                  onClick={toggleRecording}
                  disabled={isConnecting}
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isRecording 
                      ? 'bg-orange-500 text-black shadow-[0_0_40px_rgba(249,115,22,0.4)] scale-105' 
                      : 'bg-zinc-900 border border-white/10 text-zinc-500 hover:border-orange-500/50 hover:text-orange-400'
                  }`}
                >
                  {isConnecting ? (
                    <Loader2 className="w-10 h-10 animate-spin" />
                  ) : isRecording ? (
                    <div className="relative">
                      <Mic className="w-12 h-12" />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        <div className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  ) : (
                    <MicOff className="w-12 h-12 opacity-50" />
                  )}
                </button>
              </div>

              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-orange-500 animate-pulse' : 'bg-zinc-800'}`} />
                  <h4 className="font-black text-sm uppercase tracking-widest text-white italic">
                    {isConnecting ? 'Connecting...' : isRecording ? 'Link Active' : 'Standby'}
                  </h4>
                </div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
                  {isRecording 
                    ? 'I am listening. Speak your mind.' 
                    : 'Start a voice session for real-time support.'}
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-400 text-[10px] font-mono uppercase tracking-widest text-center w-full animate-in shake duration-500">
                  [ERROR]: {error}
                </div>
              )}

              {/* Status Bar */}
              <div className="w-full h-px bg-white/5 relative">
                {isRecording && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-shimmer" />
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
