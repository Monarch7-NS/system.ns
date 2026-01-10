import React from 'react';
import { HistoryState } from '../types';
import { TOTAL_GOALS } from '../constants';
import { DAILY_PLAN } from '../constants';

interface HeatmapProps {
  history: HistoryState;
}

export const Heatmap: React.FC<HeatmapProps> = ({ history }) => {
  // Generate last 60 days
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 59; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const days = generateDays();

  const getIntensity = (date: Date) => {
    const key = date.toISOString().split('T')[0];
    const log = history[key];
    
    if (!log || !log.completedIds) return 0;
    
    // Calculate adherence score (0-4)
    // 1 point for protein goal met
    // 1 point for kcal goal met
    // 1 point for > 50% schedule
    // 1 point for all habits
    
    let protein = log.extraProtein || 0;
    let kcal = log.extraKcal || 0;
    
    log.completedIds.forEach(id => {
       const block = DAILY_PLAN.find(b => b.id === id);
       if (block) {
         protein += block.totalProtein;
         kcal += block.totalKcal;
       }
    });

    let score = 0;
    if (protein >= TOTAL_GOALS.protein * 0.9) score++;
    if (kcal >= TOTAL_GOALS.kcal * 0.9) score++;
    if (log.completedIds.length >= DAILY_PLAN.length * 0.6) score++;
    
    const habitCount = log.habits ? Object.values(log.habits).filter(Boolean).length : 0;
    if (habitCount >= 3) score++;

    return score;
  };

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-slate-800';
      case 1: return 'bg-emerald-900';
      case 2: return 'bg-emerald-700';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.6)]';
      default: return 'bg-slate-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-3">
         <h3 className="text-xs font-bold text-slate-400 uppercase">Consistency Heatmap (60 Days)</h3>
         <div className="flex gap-1 items-center">
            <span className="text-[10px] text-slate-600">Less</span>
            <div className="w-2 h-2 rounded-sm bg-slate-800" />
            <div className="w-2 h-2 rounded-sm bg-emerald-900" />
            <div className="w-2 h-2 rounded-sm bg-emerald-500" />
            <div className="w-2 h-2 rounded-sm bg-emerald-300" />
            <span className="text-[10px] text-slate-600">More</span>
         </div>
      </div>
      <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
        {days.map((day, idx) => {
           const intensity = getIntensity(day);
           const dateStr = day.toLocaleDateString();
           return (
             <div 
               key={idx}
               title={`${dateStr}: Level ${intensity}`}
               className={`w-3 h-3 rounded-sm ${getColor(intensity)} transition-all hover:scale-125`}
             />
           );
        })}
      </div>
    </div>
  );
};