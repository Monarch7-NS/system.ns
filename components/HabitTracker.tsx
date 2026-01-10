import React from 'react';
import { HABITS } from '../constants';
import { Beaker, Droplets, Moon, BookOpen, Check } from 'lucide-react';

interface HabitTrackerProps {
  completedHabits: Record<string, boolean>;
  onToggle: (id: string) => void;
}

const iconMap: Record<string, any> = {
  'Beaker': Beaker,
  'Droplets': Droplets,
  'Moon': Moon,
  'BookOpen': BookOpen,
};

export const HabitTracker: React.FC<HabitTrackerProps> = ({ completedHabits, onToggle }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {HABITS.map((habit) => {
        const Icon = iconMap[habit.icon] || Beaker;
        const isDone = !!completedHabits[habit.id];

        return (
          <button
            key={habit.id}
            onClick={() => onToggle(habit.id)}
            className={`
              relative overflow-hidden group py-4 px-2 rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center gap-2
              ${isDone 
                ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                : 'bg-void-900 border-slate-800 text-slate-500 hover:border-slate-600'
              }
            `}
          >
            {/* Liquid Fill Animation */}
            <div 
                className={`absolute inset-0 bg-gradient-to-t from-purple-600 via-purple-800 to-void-900 transition-transform duration-700 ease-in-out origin-bottom z-0 ${isDone ? 'scale-y-100' : 'scale-y-0'}`} 
            />
            
            {/* Content (Z-Index to sit on top of fill) */}
            <div className="relative z-10 flex flex-col items-center gap-2">
                <div className={`p-2 rounded-xl transition-all duration-500 ${isDone ? 'bg-white/20 text-white rotate-12 scale-110' : 'bg-slate-800/50'}`}>
                  {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider text-center leading-tight transition-colors duration-300 ${isDone ? 'text-white text-shadow-sm' : ''}`}>
                    {habit.label}
                </span>
            </div>

            {/* Shine Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20" />
          </button>
        );
      })}
    </div>
  );
};