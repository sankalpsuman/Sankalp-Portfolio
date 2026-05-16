import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.fallback) return this.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#02040a]/50 backdrop-blur-md rounded-3xl border border-white/5 m-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Interface Exception</h2>
              <p className="text-gray-400 text-sm font-mono">
                {this.state.error?.message || 'A critical error occurred in the component tree.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-blue-600/20"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload Interface
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold text-sm border border-white/10"
              >
                <Home className="w-4 h-4" />
                Back to Site
              </a>
            </div>
            
            <div className="pt-6 border-t border-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
              System: Error_Caught_By_Boundary
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private get fallback() {
    return this.props.fallback;
  }
}
