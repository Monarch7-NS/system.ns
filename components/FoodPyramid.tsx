
import React from 'react';
import { PYRAMID_LEVELS } from '../constants';

export const FoodPyramid: React.FC = () => {
  return (
    <div className="bg-void-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">Nutritional Hierarchy</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">System Optimization Protocol</p>
      </div>

      <div className="flex flex-col items-center gap-2 max-w-sm mx-auto relative z-10">
        {/* Render Pyramid Levels Reversed (Top to Bottom visually, but Levels usually go Base Up) */}
        {/* We want Level 4 at Top, Level 1 at Bottom */}
        {[...PYRAMID_LEVELS].reverse().map((level, idx) => {
            // Calculate widths to create pyramid shape visually
            const widthClass = idx === 0 ? 'w-[40%]' : idx === 1 ? 'w-[60%]' : idx === 2 ? 'w-[80%]' : 'w-[100%]';
            
            return (
                <div 
                    key={idx}
                    className={`${widthClass} transition-all duration-300 hover:scale-105`}
                >
                    <div className={`
                        relative overflow-hidden rounded-lg p-3 text-center border border-white/10 shadow-lg backdrop-blur-sm
                        bg-gradient-to-br ${level.color}
                    `}>
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-slow" />
                        
                        <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mb-0.5">
                            {level.name}
                        </p>
                        <h3 className="text-xs sm:text-sm font-bold text-white text-shadow-sm">
                            {level.description}
                        </h3>
                    </div>
                    {/* Items Popout (Optional, kept simple for UI cleanliness, listing items below instead) */}
                </div>
            );
        })}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
        {PYRAMID_LEVELS.map((level, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg">
                <div className={`w-2 h-2 rounded-full mb-2 bg-gradient-to-br ${level.color}`} />
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{level.name.split(':')[1]}</h4>
                <div className="flex flex-wrap gap-1">
                    {level.items.map((item, i) => (
                        <span key={i} className="text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
