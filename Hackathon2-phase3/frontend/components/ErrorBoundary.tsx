'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 glass-panel border-neon-pink/30 bg-neon-pink/5 text-center shadow-[0_0_30px_rgba(255,0,127,0.1)]">
          <div className="w-16 h-16 bg-neon-pink/10 border border-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">System Anomaly Detected</h2>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
            {this.state.error?.message || 'A neural link disruption has occurred. System recalibration required.'}
          </p>
          <button
            className="px-8 py-3 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl hover:bg-neon-pink hover:text-white transition-all font-bold uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(255,0,127,0.2)]"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Re-Initialize System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;