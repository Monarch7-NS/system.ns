import React from 'react';
import { ScheduleBlock } from '../types';
import { Check, Circle, Clock, Flame, Utensils, Activity, Shield, Crown } from 'lucide-react';

interface TimelineProps {
  schedule: ScheduleBlock[];
  completedIds: string[];
  toggleItem: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ schedule, completedIds, toggleItem }) => {
  return (
    <div className="space-y-4 relative">
      {/* Vertical Line */}
      <div className="absolute left-[23px] top-6 bottom-6 w-px bg-slate-800 -z-10" />

      {schedule.map((block) => {
        const isCompleted = completedIds.includes(block.id);
        const isWorkout = block.type === 'workout';
        
        return (
          <div 
            key={block.id} 
            className="relative pl-14 group"
          >
            {/* Connection Line to Node */}
             <div className={`absolute left-[24px] top-1/2 w-8 h-px -z-10 transition-colors duration-500 ${isCompleted ? 'bg-purple-500/50' : 'bg-slate-800'}`} />

            {/* Timeline Node */}
            <button
              onClick={() => toggleItem(block.id)}
              className={`absolute left-0 top-1 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-500 z-10 shadow-lg hover:scale-110
                ${isCompleted 
                  ? 'bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-400 text-yellow-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                  : isWorkout 
                     ? 'bg-red-950 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                     : 'bg-void-900 border-slate-700 text-slate-600 hover:border-purple-400 hover:text-purple-400'
                }`}
            >
              {isCompleted ? <Crown className="w-6 h-6 animate-pulse-slow" /> : isWorkout ? <Activity className="w-6 h-6" /> : <Shield className="w-5 h-5" />}
            </button>

            {/* Content Card */}
            <div 
              onClick={() => toggleItem(block.id)}
              className={`p-5 rounded-2xl border transition-all duration-500 cursor-pointer backdrop-blur-sm relative overflow-hidden group/card
              ${isCompleted 
                ? 'bg-purple-900/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.05)]' 
                : isWorkout
                    ? 'bg-gradient-to-r from-red-950/20 to-transparent border-red-900/50 hover:border-red-500/50'
                    : 'bg-void-900/60 border-slate-800 hover:border-purple-500/30 hover:bg-void-900 hover:shadow-[0_0_15px_rgba(168,85,247,0.05)]'
              }`}
            >
              {/* Completed Quest Overlay (Strike effect or Shine) */}
              {isCompleted && (
                 <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-yellow-500/5 to-purple-500/5 pointer-events-none" />
              )}

              <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono font-bold text-[10px] tracking-widest ${isWorkout ? 'text-red-400' : isCompleted ? 'text-yellow-500' : 'text-purple-400'}`}>
                        {block.time}
                    </span>
                    {isCompleted && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/30 px-1.5 rounded border border-emerald-500/30">QUEST COMPLETE</span>}
                  </div>
                  <h3 className={`font-bold text-sm sm:text-base uppercase tracking-wide transition-colors ${isCompleted ? 'text-purple-200' : 'text-slate-200'}`}>
                    {block.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-1.5 mb-3 relative z-10">
                {block.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-mono transition-opacity duration-300">
                    <span className={`${isCompleted ? 'text-purple-500' : 'text-slate-600'}`}>»</span>
                    <span className={`flex-1 truncate ${isCompleted ? 'text-slate-400' : 'text-slate-300'}`}>
                        {item.name} <span className="text-slate-600 text-[10px]">[{item.quantity}]</span>
                    </span>
                  </div>
                ))}
              </div>

              {block.type !== 'workout' && (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800/50 relative z-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-void-950/50 px-2 py-1 rounded border border-slate-800/50 text-slate-400">
                      <span className="text-blue-400">P:</span>
                      <span>{block.totalProtein}g</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-void-950/50 px-2 py-1 rounded border border-slate-800/50 text-slate-400">
                      <span className="text-yellow-400">E:</span>
                      <span>{block.totalKcal}</span>
                    </div>
                  </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};