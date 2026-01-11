
import React, { useState, useEffect } from 'react';
import { api, getApiUrl, setApiUrl } from '../services/api';
import { User, HistoryState } from '../types';
import { Lock, User as UserIcon, ArrowRight, Sparkles, AlertCircle, WifiOff, Settings, Save, RotateCcw, ShieldAlert, Radio, CheckCircle2, XCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User, history: HistoryState) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(getApiUrl());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  
  // Environment Checks
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalTarget = currentApiUrl.includes('localhost') || currentApiUrl.includes('127.0.0.1') || currentApiUrl.includes('192.168.');
  const isMixedContentIssue = isHttps && isLocalTarget && !currentApiUrl.includes('ngrok');

  useEffect(() => {
    setCurrentApiUrl(getApiUrl());
    setTestStatus('idle');
    setTestMessage('');
  }, [showSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- ADMIN BYPASS LOGIC ---
    if (username === 'admin' && password === 'admin') {
        const savedHistory = localStorage.getItem('system_os_history_admin');
        const history = savedHistory ? JSON.parse(savedHistory) : {};
        onLogin({ username: 'System Administrator', token: 'admin-bypass-token' }, history);
        return;
    }

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
      
      // Smart Error Messages
      if (isMixedContentIssue) {
        setError("Browser blocked the connection. See Settings (Gear Icon) for the fix.");
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMode = () => {
    const savedHistory = localStorage.getItem('system_os_history');
    const history = savedHistory ? JSON.parse(savedHistory) : {};
    onLogin({ username: 'Offline User', token: 'offline-token' }, history);
  };

  const cleanAndFormatUrl = (input: string) => {
     let url = input.trim().replace(/\/$/, '');
     if (!url.endsWith('/api')) {
          url += '/api';
      }
      return url;
  };

  const testConnection = async () => {
      setTestStatus('testing');
      setTestMessage('Pinging...');
      
      const urlToCheck = cleanAndFormatUrl(currentApiUrl);

      try {
          const res = await fetch(`${urlToCheck}/health`);
          if (res.ok) {
              setTestStatus('success');
              setTestMessage('System Online & Reachable');
          } else {
              setTestStatus('error');
              setTestMessage(`Server Error: ${res.status}`);
          }
      } catch (err) {
          console.error(err);
          setTestStatus('error');
          if (isMixedContentIssue) {
              setTestMessage('Blocked by Browser (Use Ngrok)');
          } else {
              setTestMessage('Unreachable (Check URL/Server)');
          }
      }
  };

  const saveSettings = () => {
      const finalUrl = cleanAndFormatUrl(currentApiUrl);
      setApiUrl(finalUrl);
      setCurrentApiUrl(finalUrl); // Update UI
      setShowSettings(false);
      setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-void-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 transition-all duration-500">
            
            {/* Top Bar */}
            <div className="absolute top-4 right-4 z-20">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* HEADER */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 transform rotate-3">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">System Access</h1>
                <p className="text-slate-400 text-sm">Enter your credentials to sync progress.</p>
            </div>

            {/* SETTINGS VIEW */}
            {showSettings ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    
                    {/* Security Warning for Vercel Users */}
                    {isMixedContentIssue && (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex gap-3 items-start">
                            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="text-[11px] text-amber-200">
                                <p className="font-bold mb-1">CONNECTION BLOCKED</p>
                                <p>You are on Vercel (HTTPS) trying to reach Localhost (HTTP).</p>
                                <p className="mt-1">Browsers block this for security. To fix:</p>
                                <ol className="list-decimal ml-4 mt-1 opacity-80">
                                    <li>Install <strong>Ngrok</strong> on your PC.</li>
                                    <li>Run <code>ngrok http 5000</code> in terminal.</li>
                                    <li>Paste the HTTPS address below.</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">API Connection URL</label>
                        <input 
                            type="text" 
                            value={currentApiUrl}
                            onChange={(e) => {
                                setCurrentApiUrl(e.target.value);
                                setTestStatus('idle'); // Reset test on edit
                            }}
                            className="w-full bg-void-950 border border-slate-600 rounded-lg p-3 text-white text-sm font-mono focus:border-purple-500 outline-none"
                            placeholder="https://xxxx-xxxx.ngrok-free.app"
                        />
                        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                            Paste your Ngrok URL here. <br/>
                            <span className="text-purple-400">Note: We will automatically append /api for you.</span>
                        </p>
                    </div>

                    {/* Test Button */}
                    <button 
                        onClick={testConnection}
                        disabled={testStatus === 'testing' || !currentApiUrl}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2
                            ${testStatus === 'success' 
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                : testStatus === 'error'
                                    ? 'bg-red-500/10 border-red-500 text-red-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}
                        `}
                    >
                        {testStatus === 'testing' && <Radio className="w-4 h-4 animate-pulse" />}
                        {testStatus === 'success' && <CheckCircle2 className="w-4 h-4" />}
                        {testStatus === 'error' && <XCircle className="w-4 h-4" />}
                        {testStatus === 'idle' && <Radio className="w-4 h-4" />}
                        
                        {testStatus === 'testing' ? 'Testing...' : 
                         testStatus === 'success' ? testMessage : 
                         testStatus === 'error' ? testMessage : 'Test Network'}
                    </button>

                    <button 
                        onClick={saveSettings}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                    <button 
                        onClick={() => {
                            setApiUrl('http://127.0.0.1:5000/api');
                            setCurrentApiUrl('http://127.0.0.1:5000/api');
                            setTestStatus('idle');
                        }}
                        className="w-full py-2 text-slate-500 text-xs hover:text-white flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset to Localhost
                    </button>
                </div>
            ) : (
                /* LOGIN FORM */
                <>
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm font-bold">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
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

                    <div className="mt-4 text-center">
                         <button 
                            type="button"
                            onClick={handleOfflineMode}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700 mb-4"
                         >
                            <WifiOff className="w-4 h-4" />
                            Enter Offline Mode
                         </button>

                        <button 
                            onClick={() => { setError(''); setIsLogin(!isLogin); }}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {isLogin ? "No account? Register Protocol" : "Already initiated? Login"}
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};
