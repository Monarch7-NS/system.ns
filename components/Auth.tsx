
import React, { useState } from 'react';
import { api } from '../services/api';
import { User, HistoryState } from '../types';
import { Lock, User as UserIcon, ArrowRight, Sparkles, AlertCircle, WifiOff } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User, history: HistoryState) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOfflineOption, setShowOfflineOption] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowOfflineOption(false);

    // --- ADMIN BYPASS LOGIC ---
    // Enters directly without server authentication
    if (username === 'admin' && password === 'admin') {
        const savedHistory = localStorage.getItem('system_os_history_admin');
        const history = savedHistory ? JSON.parse(savedHistory) : {};
        
        onLogin(
            { username: 'System Administrator', token: 'admin-bypass-token' },
            history
        );
        return;
    }
    // ---------------------------

    try {
      let data;
      if (isLogin) {
        data = await api.login(username, password);
      } else {
        data = await api.register(username, password);
      }
      
      onLogin(
        { username: data.user.username, token: data.token },
        data.history || {}
      );
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || 'Authentication failed');
      // Check for network/server errors to offer offline mode
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('Network') || err.message.includes('server'))) {
        setShowOfflineOption(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMode = () => {
    // Load from local storage for offline mode
    const savedHistory = localStorage.getItem('system_os_history');
    const history = savedHistory ? JSON.parse(savedHistory) : {};
    
    onLogin(
        { username: 'Offline User', token: 'offline-token' },
        history
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-void-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 transform rotate-3">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">System Access</h1>
                <p className="text-slate-400 text-sm">Enter your credentials to sync progress.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                    <div className="flex items-center gap-3 text-red-400 text-sm font-bold">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                    {showOfflineOption && (
                        <div className="pt-2 border-t border-red-500/20">
                             <p className="text-xs text-slate-400 mb-2">Server unreachable. Ensure <code>node server.js</code> is running.</p>
                             <button 
                                type="button"
                                onClick={handleOfflineMode}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                             >
                                <WifiOff className="w-4 h-4" />
                                Access Local Data (Offline)
                             </button>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Identity</label>
                    <div className="relative group">
                        <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <input 
                            type="text" 
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full bg-void-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Passcode</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-void-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-slate-600"
                            required
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <span className="animate-pulse">Connecting...</span>
                    ) : (
                        <>
                            {isLogin ? 'Initialize System' : 'Create Profile'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => { setError(''); setShowOfflineOption(false); setIsLogin(!isLogin); }}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    {isLogin ? "No account? Register Protocol" : "Already initiated? Login"}
                </button>
            </div>
        </div>
    </div>
  );
};
