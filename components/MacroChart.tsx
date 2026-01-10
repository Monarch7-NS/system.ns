import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MacroChartProps {
  current: number;
  total: number;
  label: string;
  color: string;
  unit: string;
}

export const MacroChart: React.FC<MacroChartProps> = ({ current, total, label, color, unit }) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  
  const data = [
    { name: 'Completed', value: current },
    { name: 'Remaining', value: Math.max(0, total - current) },
  ];

  const emptyData = [
    { name: 'Empty', value: 1 },
  ];

  // Map colors to System Theme if hex is passed, otherwise use class
  const activeColor = label === "Protein" ? "#a855f7" : "#3b82f6"; // Purple for Protein, Blue for Kcal

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-void-900 rounded-xl border border-slate-800 relative">
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total === 0 ? emptyData : data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={2}
              paddingAngle={5}
            >
              <Cell key="completed" fill={activeColor} className="drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
              <Cell key="remaining" fill="#1e293b" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-lg font-bold text-white font-mono">{percentage}%</span>
        </div>
      </div>
      <div className="mt-1 text-center">
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</h3>
        <p className="text-white text-xs font-mono">
          <span className="font-bold">{Math.round(current)}</span>
          <span className="text-slate-600">/{total}</span>
        </p>
      </div>
    </div>
  );
};