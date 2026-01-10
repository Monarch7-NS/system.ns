import React, { useState } from 'react';
import { X, Zap, Check } from 'lucide-react';

interface MacroAdderProps {
  onClose: () => void;
  onAdd: (protein: number, kcal: number) => void;
}

export const MacroAdder: React.FC<MacroAdderProps> = ({ onClose, onAdd }) => {
  const [protein, setProtein] = useState('');
  const [kcal, setKcal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(protein) || 0;
    const k = parseInt(kcal) || 0;
    
    if (p > 0 || k > 0) {
      onAdd(p, k);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-void-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -z-10" />

        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="p-1.5 bg-purple-500 rounded-lg text-void-950">
                    <Zap className="w-4 h-4" />
                </div>
                Log Extra Fuel
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Protein (g)</label>
                <input 
                    type="number" 
                    value={protein}
                    onChange={e => setProtein(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full bg-void-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-lg"
                    autoFocus
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Calories (kcal)</label>
                <input 
                    type="number" 
                    value={kcal}
                    onChange={e => setKcal(e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full bg-void-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-lg"
                />
            </div>

            <button 
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
                <Check className="w-5 h-5" />
                CONFIRM ENTRY
            </button>
        </form>
      </div>
    </div>
  );
};