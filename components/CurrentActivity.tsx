import React, { useEffect, useState } from 'react';
import { DAILY_PLAN } from '../constants';
import { Clock, Radio, Activity, Zap, Swords } from 'lucide-react';

export const CurrentActivity: React.FC = () => {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getCurrentBlock = () => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Convert schedule to comparable minutes
    const blocks = DAILY_PLAN.map(b => {
      const hour = Math.floor(b.startTime / 100);
      const min = b.startTime % 100;
      const startMin = hour * 60 + min;
      return { ...b, startMin, endMin: startMin + b.durationMinutes };
    });

    const active = blocks.find(b => currentMinutes >= b.startMin && currentMinutes < b.endMin);
    const next = blocks.find(b => b.startMin > currentMinutes);
    
    return { active, next };
  };

  const { active, next } = getCurrentBlock();

  return (
    <div className="bg-void-900 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)] group">
        {/* Holographic Border Effect */}
        <div className="absolute inset-0 border border-purple-500/20 rounded-xl pointer-events-none" />
        
        {/* Animated Background Glow */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />

        <div className="flex justify-between items-start relative z-10">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded text-[10px] font-mono text-purple-300 uppercase tracking-widest flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        System Active
                    </div>
                </div>
                
                {active ? (
                    <div>
                        <h2 className="text-2xl font-black text-white mb-1 tracking-tight font-sans italic">{active.title}</h2>
                        <p className="text-purple-200/60 text-sm font-mono flex items-center gap-2">
                            <Clock className="w-3 h-3" /> 
                            UNTIL {new Date(now.setHours(Math.floor(active.startTime/100), active.startTime%100 + active.durationMinutes)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-400 mb-1">Recovering SP</h2>
                        <p className="text-slate-600 text-sm font-mono">No active quest.</p>
                    </div>
                )}
            </div>

            <div className="text-right">
                <div className="text-4xl font-bold text-white font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[10px] text-purple-400 uppercase font-bold mt-1 tracking-[0.2em]">
                    {now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric'})}
                </div>
            </div>
        </div>

        {next && (
            <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center gap-3">
                <div className="bg-void-950 p-2 rounded border border-slate-800">
                    <Swords className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Next Quest</p>
                    <p className="text-sm text-slate-200 font-bold">{next.title}</p>
                </div>
                <div className="text-sm font-mono text-purple-400">
                   {next.time}
                </div>
            </div>
        )}
    </div>
  );
};