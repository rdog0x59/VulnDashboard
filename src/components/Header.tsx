import { ShieldAlert, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export function Header({ onRefresh, isRefreshing, lastUpdated }: HeaderProps) {
  return (
    <header className="border-b border-navy-600 bg-navy-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight tracking-tight">
              VulnDashboard
            </h1>
            <p className="text-slate-500 text-xs">
              Vulnerability catalog &amp; trends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="hidden sm:block text-xs text-slate-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
              bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white
              border border-slate-700 hover:border-slate-600
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
