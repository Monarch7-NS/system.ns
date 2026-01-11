
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DAILY_PLAN, TOTAL_GOALS, APP_NAME } from './constants';
import { Timeline } from './components/Timeline';
import { MacroChart } from './components/MacroChart';
import { AICoach } from './components/AICoach';
import { Calendar } from './components/Calendar';
import { Analytics } from './components/Analytics';
import { CurrentActivity } from './components/CurrentActivity';
import { HabitTracker } from './components/HabitTracker';
import { Heatmap } from './components/Heatmap';
import { FocusTimer } from './components/FocusTimer';
import { WaterSystem } from './components/WaterSystem';
import { MacroAdder } from './components/MacroAdder';
import { Auth } from './components/Auth';
import { FoodPyramid } from './components/FoodPyramid';
import { NutrientGuide } from './components/NutrientGuide';
import { BatchInput } from './components/BatchInput';
import { Dumbbell, LayoutDashboard, CalendarDays, Plus, Trash2, Trophy, Menu, Save, CheckCircle, WifiOff, Database, Terminal, LogOut, ToggleLeft, ToggleRight, Power, RefreshCw } from 'lucide-react';
import { HistoryState, DayLog, User } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  // --- State Management ---
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'intel'>('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMacroAdder, setShowMacroAdder] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [history, setHistory] = useState<HistoryState>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // New State: Auto-Save Toggle
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // --- Auth Check ---
  useEffect(() => {
    // We handle auth via the Auth component
  }, []);

  // --- Save Function ---
  const saveData = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
        if (user.token === 'offline-token') {
             // Offline Mode: Save to LocalStorage
             localStorage.setItem('system_os_history', JSON.stringify(history));
        } else if (user.token === 'admin-bypass-token') {
             // Admin Bypass: Save to Admin LocalStorage
             localStorage.setItem('system_os_history_admin', JSON.stringify(history));
        } else {
             // Online Mode: Save to MongoDB
             await api.syncData(user.token, history);
        }
        setLastSaved(new Date());
    } catch (err) {
        console.error("Save failed:", err);
    } finally {
        setIsSyncing(false);
    }
  }, [history, user]);

  // --- Auto-Save Logic (Debounced) ---
  useEffect(() => {
    if (!user || !autoSaveEnabled) return;

    const timeoutId = setTimeout(() => {
        saveData();
    }, 2000); // Auto-save 2 seconds after last change

    return () => clearTimeout(timeoutId);
  }, [history, user, autoSaveEnabled, saveData]);

  const handleLogin = (loggedInUser: User, loadedHistory: HistoryState) => {
    setUser(loggedInUser);
    setHistory(loadedHistory);
  };

  const handleLogout = () => {
    setUser(null);
    setHistory({});
    setActiveTab('dashboard');
    // Optional: clear any persisted tokens if you implement 'keep me logged in'
  };

  // Derived date string key
  const selectedDateKey = useMemo(() => {
    return selectedDate.toISOString().split('T')[0];
  }, [selectedDate]);

  // Get current day log
  const dayLog: DayLog = useMemo(() => {
    const log = history[selectedDateKey];
    
    // Default Empty Log
    const emptyLog: DayLog = { 
        completedIds: [], 
        habits: {}, 
        extraProtein: 0, 
        extraKcal: 0, 
        waterIntake: 0, 
        readiness: 8 
    };

    if (!log) return emptyLog;

    // Safety merge
    return {
        ...emptyLog,
        ...log,
        completedIds: Array.isArray(log.completedIds) ? log.completedIds : [],
        habits: log.habits || {},
    };
  }, [history, selectedDateKey]);

  // --- Handlers ---

  const updateDayLog = (updates: Partial<DayLog>) => {
    setHistory(prev => ({
        ...prev,
        [selectedDateKey]: {
            ...(prev[selectedDateKey] || { 
                completedIds: [], habits: {}, extraProtein: 0, extraKcal: 0, waterIntake: 0, readiness: 8 
            }),
            ...updates
        }
    }));
  };

  const toggleItem = (id: string) => {
    const currentIds = dayLog.completedIds;
    const newIds = currentIds.includes(id) 
        ? currentIds.filter(i => i !== id) 
        : [...currentIds, id];
    updateDayLog({ completedIds: newIds });
  };

  const toggleHabit = (id: string) => {
      const currentHabits = dayLog.habits;
      updateDayLog({ 
          habits: { ...currentHabits, [id]: !currentHabits[id] } 
      });
  };

  const addExtra = (p: number, k: number) => {
      updateDayLog({
          extraProtein: dayLog.extraProtein + p,
          extraKcal: dayLog.extraKcal + k
      });
  };

  const addWater = (amount: number) => {
      const current = dayLog.waterIntake || 0;
      updateDayLog({ waterIntake: current + amount });
  };

  // Stats Calculation
  const currentStats = useMemo(() => {
    let protein = dayLog.extraProtein || 0;
    let kcal = dayLog.extraKcal || 0;

    if (Array.isArray(dayLog.completedIds)) {
        dayLog.completedIds.forEach(id => {
          const block = DAILY_PLAN.find(b => b.id === id);
          if (block) {
            protein += block.totalProtein;
            kcal += block.totalKcal;
          }
        });
    }

    return { protein, kcal };
  }, [dayLog]);

  const resetDay = () => {
    if (confirm("System Reset: Clear all data for this date?")) {
      const newHistory = { ...history };
      delete newHistory[selectedDateKey];
      setHistory(newHistory);
    }
  };

  // Gamification: Iron Level
  const ironLevel = useMemo(() => {
     const daysTracked = Object.keys(history).length;
     return Math.floor(daysTracked / 3) + 1;
  }, [history]);

  const isToday = new Date().toDateString() === selectedDate.toDateString();

  // --- Render Auth if not logged in ---
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-void-950 pb-28 selection:bg-purple-500/30 text-slate-100 font-sans">
      
      {/* Navbar with Fixed Plus Button */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-void-950/90 backdrop-blur-lg border-t border-purple-500/20 pb-safe">
        <div className="max-w-md mx-auto flex justify-between px-6 py-2 relative items-end">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center p-2 rounded-lg w-16 transition-all ${activeTab === 'dashboard' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-600 hover:text-slate-400'}`}
            >
                <LayoutDashboard className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Status</span>
            </button>
            
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center p-2 rounded-lg w-16 transition-all ${activeTab === 'history' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-600 hover:text-slate-400'}`}
            >
                <CalendarDays className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Logs</span>
            </button>

            <button 
                onClick={() => setActiveTab('intel')}
                className={`flex flex-col items-center p-2 rounded-lg w-16 transition-all ${activeTab === 'intel' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-600 hover:text-slate-400'}`}
            >
                <Database className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Intel</span>
            </button>

             <button 
                onClick={() => setShowTerminal(true)}
                className="flex flex-col items-center p-2 rounded-lg w-16 transition-all text-slate-600 hover:text-emerald-400"
            >
                <Terminal className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Input</span>
            </button>
        </div>
        
        {/* Floating Action Button (Only on Dashboard) */}
        {activeTab === 'dashboard' && (
             <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                 <button 
                    onClick={() => setShowMacroAdder(true)}
                    className="w-14 h-14 rounded-full bg-void-900 hover:bg-void-800 text-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-500 transition-transform hover:scale-105 active:scale-95"
                 >
                    <Plus className="w-6 h-6" />
                 </button>
            </div>
        )}
      </nav>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-void-950/80 backdrop-blur-md border-b border-purple-900/30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-900 to-void-900 border border-purple-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <div>
                 <h1 className="text-sm font-bold tracking-widest text-white uppercase font-mono hidden sm:block">Player Status</h1>
                 <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                    Level {ironLevel} 
                    {(user.token === 'offline-token' || user.token === 'admin-bypass-token') && <span className="text-slate-500 ml-1">(LOCAL)</span>}
                 </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            
             {/* Auto-Save Toggle */}
             <button 
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-all"
                title={autoSaveEnabled ? "Auto-Save Active" : "Auto-Save Disabled"}
             >
                <div className={`w-2 h-2 rounded-full ${autoSaveEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 hidden sm:block">
                    {autoSaveEnabled ? 'Auto-Save' : 'Manual'}
                </span>
             </button>

             {/* Manual Save Button */}
             <button 
                onClick={saveData}
                disabled={isSyncing}
                className="p-2 rounded-lg border border-slate-800 bg-void-900 text-purple-500 hover:text-white hover:bg-purple-600 hover:border-purple-500 transition-all shadow-lg"
                title="Save Progress"
             >
                {isSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                    <Save className="w-4 h-4" />
                )}
             </button>

            {/* Separator */}
            <div className="w-px h-8 bg-slate-800 mx-1" />

            {/* Logout */}
             <button 
                onClick={handleLogout} 
                className="p-2 bg-red-950/20 hover:bg-red-900/40 text-red-500 rounded-lg transition-all border border-red-900/30"
                title="Disconnect System"
             >
                <LogOut className="w-4 h-4" />
             </button>

          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* 1. Live Status Card */}
            {isToday && <CurrentActivity />}

            {/* 2. Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-void-900 border border-slate-800 p-3 rounded-xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Strength</p>
                            <p className="text-xl font-mono font-bold text-white">{Math.round(currentStats.protein)}g</p>
                        </div>
                        <MacroChart current={currentStats.protein} total={TOTAL_GOALS.protein} label="Protein" color="#a855f7" unit="" />
                    </div>
                </div>
                <div className="bg-void-900 border border-slate-800 p-3 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Energy</p>
                            <p className="text-xl font-mono font-bold text-white">{Math.round(currentStats.kcal)}</p>
                        </div>
                        <MacroChart current={currentStats.kcal} total={TOTAL_GOALS.kcal} label="Calories" color="#3b82f6" unit="" />
                    </div>
                </div>
            </div>

            {/* 3. Water System (New) */}
            <WaterSystem current={dayLog.waterIntake || 0} onAdd={addWater} />

            {/* 4. Daily Directives */}
            <section>
                <div className="flex items-center justify-between mb-3">
                     <h2 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                        Daily Directives
                     </h2>
                </div>
                <HabitTracker completedHabits={dayLog.habits} onToggle={toggleHabit} />
            </section>

            {/* 5. Focus Timer */}
            <section>
                 <FocusTimer />
            </section>

            {/* 6. Quest Log */}
            <section className="bg-void-900/50 border border-slate-800 rounded-xl p-5 relative">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Trophy className="w-24 h-24 text-purple-500" />
              </div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Quest Log</h2>
                <div className="text-[10px] font-mono text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded bg-purple-500/10">
                    {dayLog.completedIds.length}/{DAILY_PLAN.length} COMPLETED
                </div>
              </div>
              <Timeline 
                schedule={DAILY_PLAN} 
                completedIds={dayLog.completedIds} 
                toggleItem={toggleItem} 
              />
            </section>

             {/* Extras Display */}
             {(dayLog.extraProtein > 0 || dayLog.extraKcal > 0) && (
                <div className="bg-slate-900 p-4 rounded-xl border border-dashed border-slate-700 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-white font-mono">Bonus Stats</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Manual Entries</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-mono text-purple-400">+{dayLog.extraProtein} STR</p>
                        <p className="text-xs font-mono text-blue-400">+{dayLog.extraKcal} ENG</p>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* VIEW: HISTORY / LOG */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <div className="bg-void-900 rounded-xl border border-slate-800 p-1">
                <Calendar 
                    selectedDate={selectedDate} 
                    onSelectDate={setSelectedDate} 
                    history={history as any} 
                />
            </div>

            <Analytics history={history as any} selectedDate={selectedDate} />

            <Heatmap history={history} />

            <button 
                onClick={resetDay}
                className="w-full py-4 rounded-xl border border-red-900/30 bg-red-950/20 text-red-500 font-bold uppercase tracking-widest hover:bg-red-900/30 transition-all flex items-center justify-center gap-2 font-mono text-xs"
            >
                <Trash2 className="w-4 h-4" /> System Reset (Day)
            </button>
          </div>
        )}

        {/* VIEW: INTEL (DATABASE) */}
        {activeTab === 'intel' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                 <FoodPyramid />
                 <NutrientGuide />
                 
                 <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-500 font-mono">
                        System Database v2.1 // Loaded
                    </p>
                 </div>
             </div>
        )}

        {/* QUICK ADD MODAL */}
        {showMacroAdder && (
            <MacroAdder 
                onClose={() => setShowMacroAdder(false)} 
                onAdd={addExtra} 
            />
        )}

        {/* BATCH INPUT TERMINAL */}
        {showTerminal && (
            <BatchInput
                onClose={() => setShowTerminal(false)}
                onAddExtra={addExtra}
                onAddWater={addWater}
                onToggleItem={toggleItem}
                onToggleHabit={toggleHabit}
            />
        )}

      </main>

      <AICoach />
    </div>
  );
};

export default App;
