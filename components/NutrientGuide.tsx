
import React, { useState } from 'react';
import { NUTRIENT_DATABASE } from '../constants';
import { Zap, Activity, Leaf, Flame } from 'lucide-react';

type Category = 'protein' | 'calories' | 'carbs' | 'fiber';

export const NutrientGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('protein');

  const tabs = [
    { id: 'protein', label: 'Protein', icon: Activity, color: 'text-purple-400', border: 'border-purple-500' },
    { id: 'calories', label: 'Calories', icon: Flame, color: 'text-blue-400', border: 'border-blue-500' },
    { id: 'carbs', label: 'Carbs', icon: Zap, color: 'text-amber-400', border: 'border-amber-500' },
    { id: 'fiber', label: 'Fiber', icon: Leaf, color: 'text-emerald-400', border: 'border-emerald-500' },
  ];

  const data = NUTRIENT_DATABASE[activeTab].sort((a, b) => b.value - a.value);
  const maxValue = data[0]?.value || 100;

  return (
    <div className="bg-void-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Resource Database
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Category)}
              className={`flex-1 min-w-[80px] py-4 flex flex-col items-center justify-center gap-1 transition-all relative ${isActive ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? tab.color : 'text-slate-600'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-white' : 'text-slate-600'}`}>
                {tab.label}
              </span>
              {isActive && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.color.replace('text-', 'bg-')}`} />}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest px-2 pb-2">
            <span>Item (per {data[0]?.serving})</span>
            <span>Density</span>
        </div>
        {data.map((item, idx) => {
           const percent = (item.value / maxValue) * 100;
           const tabColor = tabs.find(t => t.id === activeTab)?.color.replace('text-', 'bg-');
           
           return (
             <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-slate-800/20 rounded-lg -z-10 scale-95 group-hover:scale-100 transition-transform" />
                <div className="flex items-center justify-between p-3 relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-200">{item.name}</span>
                            {item.tag && <span className="text-[9px] bg-slate-800 text-slate-500 px-1.5 rounded border border-slate-700">{item.tag}</span>}
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full opacity-80 ${tabColor}`} 
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>
                    <div className="ml-4 text-right min-w-[60px]">
                        <span className={`text-lg font-mono font-bold ${tabs.find(t => t.id === activeTab)?.color}`}>
                            {item.value}
                        </span>
                        <span className="text-xs text-slate-500 ml-0.5">{item.unit}</span>
                    </div>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};
