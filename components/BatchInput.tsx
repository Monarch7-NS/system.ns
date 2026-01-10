
import React, { useState } from 'react';
import { X, Terminal, Play, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { DAILY_PLAN, HABITS } from '../constants';

interface BatchInputProps {
  onClose: () => void;
  onAddExtra: (p: number, k: number) => void;
  onAddWater: (amount: number) => void;
  onToggleItem: (id: string) => void;
  onToggleHabit: (id: string) => void;
}

export const BatchInput: React.FC<BatchInputProps> = ({ 
  onClose, 
  onAddExtra, 
  onAddWater, 
  onToggleItem,
  onToggleHabit
}) => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const executeCommands = () => {
    const lines = input.split('\n');
    const newLogs: string[] = [];
    let pTotal = 0;
    let kTotal = 0;
    let wTotal = 0;

    lines.forEach(line => {
      const clean = line.trim().toLowerCase();
      if (!clean) return;

      let matched = false;

      // 1. Protein: "p 30"
      const pMatch = clean.match(/^(?:p|pro)\s+(\d+)$/);
      if (pMatch) {
        const val = parseInt(pMatch[1]);
        pTotal += val;
        newLogs.push(`✅ Added ${val}g Protein`);
        matched = true;
      }

      // 2. Calories: "k 500" or "c 500"
      const kMatch = clean.match(/^(?:k|c|kcal)\s+(\d+)$/);
      if (kMatch) {
        const val = parseInt(kMatch[1]);
        kTotal += val;
        newLogs.push(`✅ Added ${val} kcal`);
        matched = true;
      }

      // 3. Water: "w 250"
      const wMatch = clean.match(/^(?:w|water)\s+(\d+)$/);
      if (wMatch) {
        const val = parseInt(wMatch[1]);
        wTotal += val;
        newLogs.push(`✅ Added ${val}ml Water`);
        matched = true;
      }

      // 4. Schedule: "done 1", "done 4am", "done lunch"
      const doneMatch = clean.match(/^(?:done|fin)\s+(.+)$/);
      if (doneMatch) {
        const target = doneMatch[1].trim();
        // Try index (1-based)
        const index = parseInt(target);
        if (!isNaN(index) && index > 0 && index <= DAILY_PLAN.length) {
          onToggleItem(DAILY_PLAN[index - 1].id);
          newLogs.push(`✅ Completed Block #${index}`);
          matched = true;
        } else {
          // Try fuzzy search title or time
          const block = DAILY_PLAN.find(b => 
            b.title.toLowerCase().includes(target) || 
            b.time.toLowerCase().includes(target) ||
            b.time.replace(':', '').toLowerCase().includes(target) // "0400"
          );
          if (block) {
            onToggleItem(block.id);
            newLogs.push(`✅ Completed "${block.title}"`);
            matched = true;
          } else {
             newLogs.push(`⚠️ Block not found: "${target}"`);
          }
        }
      }

      // 5. Habits: "habit sleep", "h creatine"
      const habitMatch = clean.match(/^(?:h|habit|check)\s+(.+)$/);
      if (habitMatch) {
        const target = habitMatch[1].trim();
        const habit = HABITS.find(h => h.id.includes(target) || h.label.toLowerCase().includes(target));
        if (habit) {
          onToggleHabit(habit.id);
          newLogs.push(`✅ Checked Habit "${habit.label}"`);
          matched = true;
        } else {
          newLogs.push(`⚠️ Habit not found: "${target}"`);
        }
      }

      if (!matched && !doneMatch) { // doneMatch already handles not found logic
         // newLogs.push(`❓ Unknown: "${clean}"`);
      }
    });

    if (pTotal > 0 || kTotal > 0) onAddExtra(pTotal, kTotal);
    if (wTotal > 0) onAddWater(wTotal);
    
    setLogs(newLogs);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-void-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-500" />
            <h3 className="font-mono font-bold text-white tracking-wider">SYSTEM_TERMINAL</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowHelp(!showHelp)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                <HelpCircle className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            
            {showHelp && (
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 space-y-1">
                    <p className="font-bold text-emerald-400 mb-2">Valid Commands:</p>
                    <p><span className="text-yellow-400">p 30</span> : Add 30g Protein</p>
                    <p><span className="text-yellow-400">k 500</span> : Add 500 Kcal</p>
                    <p><span className="text-yellow-400">w 250</span> : Add 250ml Water</p>
                    <p><span className="text-yellow-400">done 1</span> : Complete Block #1</p>
                    <p><span className="text-yellow-400">done 4am</span> : Complete 4 AM Block</p>
                    <p><span className="text-yellow-400">h sleep</span> : Check Sleep Habit</p>
                </div>
            )}

            <div className="flex-1 relative">
                <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`> Enter batch commands...\np 30\nk 200\ndone 1\nh creatine`}
                    className="w-full h-full bg-black/50 border border-slate-800 rounded-xl p-4 font-mono text-sm text-emerald-400 placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 resize-none"
                    autoFocus
                />
            </div>

            {logs.length > 0 && (
                <div className="max-h-32 overflow-y-auto bg-slate-900/50 rounded-xl p-3 border border-slate-800 font-mono text-xs space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className="text-slate-300 border-b border-slate-800/50 last:border-0 pb-1 last:pb-0">
                            {log}
                        </div>
                    ))}
                </div>
            )}

            <button 
                onClick={executeCommands}
                disabled={!input.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold font-mono rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
                <Play className="w-4 h-4 fill-current" /> EXECUTE_BATCH
            </button>
        </div>
      </div>
    </div>
  );
};
