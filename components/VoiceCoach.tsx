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
        className="p-2 text-zinc-400 hover:text-orange-400 transition-colors flex flex-col items-center gap-1 group relative"
      >
        <Mic className="w-5 h-5" />
        <span className="text-[10px] font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 absolute -top-8 bg-zinc-800 px-2 py-1 rounded whitespace-nowrap">Voice Coach</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="font-bold flex items-center gap-2">
                <Mic className="w-4 h-4 text-orange-400" />
                Live Voice Coach
              </h3>
              <button onClick={() => { setIsOpen(false); cleanupAudio(); }} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full ${isRecording ? 'bg-orange-500/20 animate-ping' : ''}`} />
                <button
                  onClick={toggleRecording}
                  disabled={isConnecting}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-orange-500 text-white shadow-[0_0_30px_rgba(249,115,22,0.5)]' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {isConnecting ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : isRecording ? (
                    <Mic className="w-10 h-10" />
                  ) : (
                    <MicOff className="w-10 h-10" />
                  )}
                </button>
              </div>

              <div className="text-center space-y-2">
                <h4 className="font-bold text-lg">
                  {isConnecting ? 'Connecting...' : isRecording ? 'Listening...' : 'Tap to start'}
                </h4>
                <p className="text-sm text-zinc-400">
                  {isRecording 
                    ? 'Speak naturally. The coach will reply with voice.' 
                    : 'Get real-time motivation and advice.'}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm text-center w-full">
                  {error}
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
