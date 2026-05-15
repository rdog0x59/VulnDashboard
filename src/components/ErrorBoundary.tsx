import { Component, type ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-white font-semibold text-lg mb-2">Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-4">{this.state.error.message}</p>
            <button
              onClick={() => { localStorage.clear(); location.reload(); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
            >
              Clear cache &amp; reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
