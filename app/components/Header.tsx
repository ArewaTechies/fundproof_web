'use client';

import { ShieldCheck, History, Sun, Moon } from 'lucide-react';

type HeaderProps = {
  setShowHistory: (show: boolean) => void;
  showHistory: boolean;
  toggleTheme: () => void;
  isDarkMode: boolean;
  setShowApp: (show: boolean) => void;
};

export default function Header({ setShowHistory, showHistory, toggleTheme, isDarkMode, setShowApp }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/50 shadow-2xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setShowApp(false)}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-400 p-2.5 rounded-xl">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">FundProof</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowApp(false)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 text-sm font-medium"
            >
              Back to Home
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 text-sm font-medium"
            >
              <History size={16} />
              History
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-300" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}