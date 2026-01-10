
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, AreaChart, Area, ReferenceLine, 
  RadialBarChart, RadialBar, ComposedChart, Cell
} from 'recharts';
import { HistoryState, DayLog } from '../types';
import { DAILY_PLAN, TOTAL_GOALS } from '../constants';
import { Activity, Flame, Droplets, Moon, Zap, TrendingUp, Target, Calendar as CalendarIcon, PieChart, Clock } from 'lucide-react';

interface AnalyticsProps {
  history: HistoryState;
  selectedDate: Date;
}

type AnalyticsView = 'overview' | 'protein' | 'kcal' | 'water' | 'recovery';
type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-void-950/90 border border-purple-500/20 p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md z-50">
        <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
             <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }} />
                 <span className="text-xs font-bold text-slate-300">{entry.name}</span>
             </div>
             <p className="text-sm font-mono font-bold text-white">
                {typeof entry.value === 'number' ? Math.round(entry.value) : entry.value} <span className="text-[10px] text-slate-500">{entry.unit}</span>
             </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
        <div className={`absolute right-0 top-0 p-12 opacity-5 blur-xl rounded-full ${color.replace('text-', 'bg-')}`} />
        <div className="relative z-10">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-mono font-bold ${color} tracking-tight`}>{value}</p>
            <p className="text-[9px] text-slate-400 mt-1 font-mono border-t border-slate-800/50 pt-1 inline-block">{subtext}</p>
        </div>
        <div className={`p-3 rounded-lg bg-void-950/50 border border-slate-800/50 ${color.replace('text-', 'text-opacity-80 text-')} relative z-10`}>
            <Icon className="w-5 h-5" />
        </div>
    </div>
);

export const Analytics: React.FC<AnalyticsProps> = ({ history, selectedDate }) => {
  const [view, setView] = useState<AnalyticsView>('overview');
  const [range, setRange] = useState<TimeRange>('1W');

  // --- Helper: Get Stats for a Single Day ---
  const getDailyStats = (dateStr: string, log: DayLog | undefined) => {
    let protein = log?.extraProtein || 0;
    let kcal = log?.extraKcal || 0;
    
    if (log?.completedIds) {
        log.completedIds.forEach(id => {
            const block = DAILY_PLAN.find(b => b.id === id);
            if (block) {
                protein += block.totalProtein;
                kcal += block.totalKcal;
            }
        });
    }
    return {
        protein,
        kcal,
        water: log?.waterIntake || 0,
        sleep: log?.habits?.['sleep'] ? 1 : 0,
        creatine: log?.habits?.['creatine'] ? 1 : 0,
    };
  };

  // --- Data Processing (Aggregation Logic) ---
  const { chartData, selectedDayStats, averages } = useMemo(() => {
    const rawData: any[] = [];
    const endDate = new Date(selectedDate);
    let startDate = new Date(selectedDate);
    let granularity: 'day' | 'week' | 'month' = 'day';

    // 1. Determine Range & Granularity
    switch (range) {
        case '1W':
            startDate.setDate(endDate.getDate() - 6);
            granularity = 'day';
            break;
        case '1M':
            startDate.setDate(endDate.getDate() - 29);
            granularity = 'day';
            break;
        case '3M':
            startDate.setDate(endDate.getDate() - 90);
            granularity = 'week';
            break;
        case '6M':
            startDate.setMonth(endDate.getMonth() - 6);
            granularity = 'week';
            break;
        case '1Y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            granularity = 'month';
            break;
        case 'ALL':
            // Find earliest date in history, default to 1 year ago if empty
            const historyDates = Object.keys(history).sort();
            if (historyDates.length > 0) {
                startDate = new Date(historyDates[0]);
            } else {
                startDate.setFullYear(endDate.getFullYear() - 1);
            }
            granularity = 'month';
            break;
    }

    // 2. Helper to generate labels
    const formatDateLabel = (date: Date, gran: string) => {
        if (gran === 'day') return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        if (gran === 'week') return `W${getWeekNumber(date)}`;
        if (gran === 'month') return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        return '';
    };

    const getWeekNumber = (d: Date) => {
        const onejan = new Date(d.getFullYear(), 0, 1);
        const millisecsInDay = 86400000;
        return Math.ceil((((d.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7);
    };

    // 3. Generate Time Buckets
    const buckets: Record<string, { count: number, protein: number, kcal: number, water: number, sleep: number, creatine: number, dateObj: Date }> = {};
    const bucketKeys: string[] = [];

    // Iterate day by day from start to end
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const log = history[dateStr];
        const stats = getDailyStats(dateStr, log);

        // Determine Bucket Key
        let key = '';
        if (granularity === 'day') key = dateStr;
        else if (granularity === 'week') {
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay()); // Sunday start
            key = weekStart.toISOString().split('T')[0];
        } 
        else if (granularity === 'month') {
            key = `${d.getFullYear()}-${d.getMonth() + 1}`; 
        }

        if (!buckets[key]) {
            buckets[key] = { count: 0, protein: 0, kcal: 0, water: 0, sleep: 0, creatine: 0, dateObj: new Date(d) };
            bucketKeys.push(key);
        }

        // Add stats only if log exists or we want to count zeros? 
        // Counting zeros creates a true average. Ignoring them shows "average on tracked days".
        // Let's count zeros to encourage consistency, unless it's future dates.
        if (d <= new Date()) { 
             buckets[key].count++;
             buckets[key].protein += stats.protein;
             buckets[key].kcal += stats.kcal;
             buckets[key].water += stats.water;
             buckets[key].sleep += stats.sleep;
             buckets[key].creatine += stats.creatine;
        }
    }

    // 4. Flatten to Chart Data
    bucketKeys.forEach(key => {
        const b = buckets[key];
        const count = b.count || 1; // Avoid divide by zero
        rawData.push({
            shortDate: formatDateLabel(b.dateObj, granularity),
            fullDate: b.dateObj.toISOString(),
            protein: Math.round(b.protein / count),
            kcal: Math.round(b.kcal / count),
            water: Math.round(b.water / count),
            sleep: parseFloat((b.sleep / count).toFixed(2)), // 0-1 scale for habits becomes 0-1 probability
            creatine: parseFloat((b.creatine / count).toFixed(2)),
            // For daily view, strict boolean
            isSleep: b.sleep > 0, 
            isCreatine: b.creatine > 0
        });
    });

    // 5. Selected Day Stats (Specific Point in Time)
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const selectedLog = history[selectedDateStr];
    const dayStatsRaw = getDailyStats(selectedDateStr, selectedLog);
    
    // 6. Averages for the whole period
    const totalCount = rawData.length || 1;
    const totals = rawData.reduce((acc, curr) => ({
        protein: acc.protein + curr.protein,
        kcal: acc.kcal + curr.kcal,
        water: acc.water + curr.water
    }), { protein: 0, kcal: 0, water: 0 });

    return { 
        chartData: rawData, 
        selectedDayStats: { ...dayStatsRaw, shortDate: selectedDate.toLocaleDateString('en-US', {month:'short', day:'numeric'}) },
        averages: {
            protein: Math.round(totals.protein / totalCount),
            kcal: Math.round(totals.kcal / totalCount),
            water: Math.round(totals.water / totalCount)
        }
    };
  }, [history, selectedDate, range]);

  // --- Render Views ---

  const renderOverview = () => {
    // Data for Radial Chart (Selected Day)
    const radialData = [
        { name: 'Protein', value: selectedDayStats.protein, max: TOTAL_GOALS.protein, fill: '#a855f7' },
        { name: 'Energy', value: selectedDayStats.kcal, max: TOTAL_GOALS.kcal, fill: '#3b82f6' },
        { name: 'Hydration', value: selectedDayStats.water, max: TOTAL_GOALS.water, fill: '#06b6d4' },
    ];

    return (
    <div className="space-y-6">
        {/* Day Snapshot */}
        <div className="bg-void-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="30%" 
                            outerRadius="100%" 
                            data={radialData} 
                            startAngle={180} 
                            endAngle={0}
                        >
                            <RadialBar
                                background={{ fill: '#1e293b' }}
                                dataKey="value"
                                cornerRadius={10}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pt-4">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Day</span>
                        <span className="text-lg font-bold text-white">{new Date(selectedDate).getDate()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="text-center sm:text-left">
                        <div className="text-[10px] text-purple-400 font-bold uppercase mb-1">Protein</div>
                        <div className="text-xl font-mono font-bold text-white">{selectedDayStats.protein}g</div>
                        <div className="text-[9px] text-slate-500">of {TOTAL_GOALS.protein}g</div>
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Energy</div>
                        <div className="text-xl font-mono font-bold text-white">{selectedDayStats.kcal}</div>
                        <div className="text-[9px] text-slate-500">of {TOTAL_GOALS.kcal}</div>
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Water</div>
                        <div className="text-xl font-mono font-bold text-white">{(selectedDayStats.water / 1000).toFixed(1)}L</div>
                        <div className="text-[9px] text-slate-500">of {(TOTAL_GOALS.water / 1000).toFixed(1)}L</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Trend Cards */}
        <div className="grid grid-cols-2 gap-3">
            <StatCard 
                label={`${range} Avg Protein`} 
                value={`${averages.protein}g`} 
                subtext="Anabolic Consistency" 
                icon={Activity} 
                color="text-purple-400" 
            />
            <StatCard 
                label={`${range} Avg Kcal`} 
                value={averages.kcal} 
                subtext="Energy Surplus" 
                icon={Flame} 
                color="text-blue-400" 
            />
        </div>

        {/* Main Trend Chart */}
        <div className="bg-void-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-slate-200 font-bold mb-6 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Progress View
            </h3>
            <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} barGap={0}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="shortDate" stroke="#475569" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} interval={range === '1W' ? 0 : 'preserveStartEnd'} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                
                {/* Visual Guide for Selected Date */}
                <ReferenceLine x={selectedDayStats.shortDate} stroke="#fff" strokeDasharray="3 3" strokeOpacity={0.3} />
                
                <Bar dataKey="protein" name="Protein" fill="url(#barGradient)" radius={[2, 2, 0, 0]} barSize={range === '1W' ? 20 : range === '1M' ? 8 : undefined} unit="g" />
                <Line type="monotone" dataKey="kcal" name="Kcal" stroke="#3b82f6" strokeWidth={2} dot={range === '1W'} unit="kcal" yAxisId="right" />
                
                {/* Secondary Axis for Kcal to scale roughly with Protein visually */}
                <YAxis yAxisId="right" orientation="right" hide domain={[0, 4000]} />
                <YAxis hide domain={[0, 300]} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
        </div>
    </div>
    );
  };

  const renderProtein = () => (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-950/40 to-void-900 border border-purple-500/20 p-4 rounded-xl flex items-center justify-between">
             <div className="flex items-center gap-4">
                 <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Target className="w-6 h-6 text-purple-400" />
                 </div>
                 <div>
                     <h4 className="text-sm font-bold text-white">Hypertrophy Goal</h4>
                     <p className="text-xs text-slate-400 mt-1 font-mono">
                        Target: <span className="text-purple-400 font-bold">{TOTAL_GOALS.protein}g</span>
                     </p>
                 </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Today</p>
                <p className={`text-xl font-mono font-bold ${selectedDayStats.protein >= TOTAL_GOALS.protein ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {Math.round((selectedDayStats.protein / TOTAL_GOALS.protein) * 100)}%
                </p>
             </div>
        </div>

        <div className="bg-void-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <defs>
                            <linearGradient id="proteinArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip />} />
                        
                        <ReferenceLine y={TOTAL_GOALS.protein} stroke="#e879f9" strokeDasharray="3 3" strokeOpacity={0.6} label={{ position: 'insideTopRight', value: 'TARGET', fill: '#e879f9', fontSize: 9 }} />
                        <ReferenceLine x={selectedDayStats.shortDate} stroke="#fff" strokeDasharray="3 3" strokeOpacity={0.2} />

                        <Area type="monotone" dataKey="protein" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#proteinArea)" name="Protein" unit="g" />
                        <Bar dataKey="protein" barSize={range === '1W' ? 8 : 4} fill="#e879f9" fillOpacity={0.2} radius={[2,2,0,0]} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );

  const renderKcal = () => (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-950/40 to-void-900 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
             <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Activity className="w-6 h-6 text-blue-400" />
                 </div>
                 <div>
                     <h4 className="text-sm font-bold text-white">Caloric Surplus</h4>
                     <p className="text-xs text-slate-400 mt-1 font-mono">
                        Target: <span className="text-blue-400 font-bold">{TOTAL_GOALS.kcal} kcal</span>
                     </p>
                 </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Today</p>
                <p className={`text-xl font-mono font-bold ${selectedDayStats.kcal >= TOTAL_GOALS.kcal ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {selectedDayStats.kcal}
                </p>
             </div>
        </div>

        <div className="bg-void-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip />} />
                        
                        <ReferenceLine y={TOTAL_GOALS.kcal} stroke="#60a5fa" strokeDasharray="3 3" strokeOpacity={0.6} label={{ position: 'insideTopRight', value: 'SURPLUS TARGET', fill: '#60a5fa', fontSize: 9 }} />
                        <ReferenceLine x={selectedDayStats.shortDate} stroke="#fff" strokeDasharray="3 3" strokeOpacity={0.2} />

                        {/* Split Bar Colors based on hitting target */}
                        <Bar dataKey="kcal" name="Calories" radius={[4, 4, 0, 0]} maxBarSize={40} unit="kcal">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.kcal >= TOTAL_GOALS.kcal ? '#3b82f6' : '#1e3a8a'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );

  const renderWater = () => (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-cyan-950/40 to-void-900 border border-cyan-500/20 p-4 rounded-xl flex items-center justify-between">
             <div className="flex items-center gap-4">
                 <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <Droplets className="w-6 h-6 text-cyan-400" />
                 </div>
                 <div>
                     <h4 className="text-sm font-bold text-white">Hydration Engine</h4>
                     <p className="text-xs text-slate-400 mt-1 font-mono">
                        Target: <span className="text-cyan-400 font-bold">{TOTAL_GOALS.water}ml</span>
                     </p>
                 </div>
             </div>
        </div>

        <div className="bg-void-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                         <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={TOTAL_GOALS.water} stroke="#22d3ee" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'OPTIMAL', fill: '#22d3ee', fontSize: 9 }} />
                        <Bar dataKey="water" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Water" unit="ml" maxBarSize={30}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fillOpacity={entry.water >= TOTAL_GOALS.water ? 1 : 0.5} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );

  const renderRecovery = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Moon className="w-5 h-5" />
                        <span className="font-bold text-sm">Sleep</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Consistency</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-2">
                    {Math.round(averages.protein > 0 ? (averages.protein / TOTAL_GOALS.protein) * 100 : 0)}%
                </div>
                {/* For daily views, show individual days. For aggregated, show heatmap bar */}
                <div className="flex gap-1 h-8 items-end">
                    {chartData.slice(-14).map((day, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 rounded-sm ${day.sleep >= 0.5 ? 'bg-indigo-500 h-6' : 'bg-slate-800 h-2'}`}
                        />
                    ))}
                </div>
             </div>
             
             <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Zap className="w-5 h-5" />
                        <span className="font-bold text-sm">Creatine</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Consistency</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-2">
                   {Math.round(averages.water > 0 ? (averages.water / TOTAL_GOALS.water) * 100 : 0)}%
                </div>
                <div className="flex gap-1 h-8 items-end">
                    {chartData.slice(-14).map((day, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 rounded-sm ${day.creatine >= 0.5 ? 'bg-emerald-500 h-6' : 'bg-slate-800 h-2'}`}
                        />
                    ))}
                </div>
             </div>
        </div>
        
        <div className="bg-void-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h4 className="text-sm font-bold text-white mb-4">Habit Stacking Index</h4>
             <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                         <defs>
                             <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                         <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                         <YAxis hide />
                         <Tooltip content={<CustomTooltip />} />
                         <ReferenceLine x={selectedDayStats.shortDate} stroke="#fff" strokeDasharray="3 3" strokeOpacity={0.2} />
                         
                         <Area type="step" dataKey="sleep" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} name="Sleep Score" />
                         <Area type="step" dataKey="creatine" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Creatine Score" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Date Header for Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
         <div className="flex items-center gap-2 text-slate-400">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">
                End Date: <span className="text-white font-bold">{selectedDayStats.shortDate}</span>
            </span>
         </div>

         {/* Time Range Selector */}
         <div className="flex bg-void-900 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            {(['1W', '1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((r) => (
                <button 
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${range === r ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                >
                    {r}
                </button>
            ))}
         </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {[
            { id: 'overview', label: 'Overview', icon: PieChart },
            { id: 'protein', label: 'Protein', icon: Activity },
            { id: 'kcal', label: 'Energy', icon: Flame },
            { id: 'water', label: 'Hydration', icon: Droplets },
            { id: 'recovery', label: 'Recovery', icon: Moon },
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setView(tab.id as AnalyticsView)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border
                    ${view === tab.id 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                        : 'bg-void-900 border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800'}
                `}
            >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
            </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {view === 'overview' && renderOverview()}
        {view === 'protein' && renderProtein()}
        {view === 'kcal' && renderKcal()}
        {view === 'water' && renderWater()}
        {view === 'recovery' && renderRecovery()}
      </div>

    </div>
  );
};
