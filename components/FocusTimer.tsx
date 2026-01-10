import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, BrainCircuit, Sparkles } from 'lucide-react';

export const FocusTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = () => {
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-slate-950/80 backdrop-blur-xl border border-white/5 shadow-lg group">
      
       {/* Ambient Pulse when Active */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -z-10 transition-opacity duration-1000 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-colors duration-500 ${isActive ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-800/50 text-slate-500'}`}>
            <BrainCircuit className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mode === 'focus' ? 'Focus Protocol' : 'Recovery Phase'}</p>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
            </div>
            <p className="text-3xl font-mono font-black text-white tracking-widest tabular-nums">{formatTime(timeLeft)}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={toggleTimer}
             className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${isActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20'}`}
           >
             {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
           </button>
           
           <div className="flex flex-col gap-2">
                <button 
                onClick={resetTimer}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Reset"
                >
                <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                onClick={switchMode}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Switch Mode"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                </button>
           </div>
        </div>
      </div>
    </div>
  );
};