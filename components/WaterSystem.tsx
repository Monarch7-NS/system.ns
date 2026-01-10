import React, { useState } from 'react';
import { TOTAL_GOALS } from '../constants';
import { Droplets, Plus, Minus, RotateCcw, Sparkles } from 'lucide-react';

interface WaterSystemProps {
  current: number;
  onAdd: (amount: number) => void;
}

export const WaterSystem: React.FC<WaterSystemProps> = ({ current, onAdd }) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  const percentage = Math.min(100, Math.max(0, (current / TOTAL_GOALS.water) * 100));

  const handleAction = (amount: number) => {
    if (isRemoveMode) {
      // Prevent negative total if desired, or allow correction
      onAdd(-amount); 
    } else {
      onAdd(amount);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      handleAction(amount);
      setCustomAmount('');
    }
  };

  const handleReset = () => {
    // Reset to 0 by subtracting current amount
    if (current > 0) onAdd(-current);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 transition-all duration-500 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-950/80 backdrop-blur-xl border border-white/5 shadow-[0_8px_32px_rgba(31,38,135,0.15)] group">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200 uppercase tracking-[0.2em]">
                        Mana Pool
                    </h3>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-sans font-black tracking-tight transition-colors duration-300 ${isRemoveMode ? 'text-red-300' : 'text-white'}`}>
                        {current}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">/ {TOTAL_GOALS.water}ml</span>
                </div>
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={() => setIsRemoveMode(!isRemoveMode)}
                    className={`p-2 rounded-xl transition-all duration-300 ${isRemoveMode ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    title={isRemoveMode ? "Switch to Fill Mode" : "Switch to Drain Mode"}
                >
                    {isRemoveMode ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
                <button 
                    onClick={handleReset}
                    className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-300 hover:rotate-180"
                    title="Empty Vessel"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Liquid Progress Bar */}
        <div className="relative h-6 bg-slate-900/50 rounded-full mb-8 shadow-inner overflow-hidden border border-white/5">
            <div 
                className={`absolute inset-0 transition-all duration-1000 ease-out ${isRemoveMode ? 'bg-gradient-to-r from-red-900/50 to-red-600/50' : 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-fuchsia-600/20'}`} 
            />
            <div 
                className={`h-full relative transition-all duration-1000 ease-out rounded-full ${isRemoveMode ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500'}`}
                style={{ width: `${percentage}%` }}
            >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/40" />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/20" />
                
                {/* Glow */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-sm" />
            </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                {[250, 500, 750].map((amount) => (
                    <button 
                        key={amount}
                        onClick={() => handleAction(amount)}
                        className={`
                            relative overflow-hidden group py-3 rounded-2xl border transition-all duration-300
                            ${isRemoveMode 
                                ? 'bg-red-950/20 border-red-500/20 hover:bg-red-900/30 hover:border-red-500/50' 
                                : 'bg-white/5 border-white/5 hover:bg-purple-500/10 hover:border-purple-500/30'
                            }
                        `}
                    >
                        <div className="relative z-10 flex flex-col items-center gap-1">
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${isRemoveMode ? 'text-red-400' : 'text-slate-400 group-hover:text-purple-300'}`}>
                                {amount === 250 ? 'Sip' : amount === 500 ? 'Flask' : 'Vessel'}
                            </span>
                            <span className={`text-lg font-bold ${isRemoveMode ? 'text-red-200' : 'text-white'}`}>
                                {isRemoveMode ? '-' : '+'}{amount}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomSubmit} className="relative group">
                <input 
                    type="number" 
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom elixir amount..."
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-center"
                />
                <button 
                    type="submit"
                    className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${isRemoveMode ? 'bg-red-500 hover:bg-red-600 shadow-red-900/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'}`}
                >
                    {isRemoveMode ? 'DRAIN' : 'CAST'}
                </button>
            </form>
        </div>
    </div>
  );
};
