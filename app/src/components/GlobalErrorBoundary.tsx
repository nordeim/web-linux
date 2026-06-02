// ============================================================
// GlobalErrorBoundary — Prevents one app crash from destroying the OS shell
// ============================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * GlobalErrorBoundary — Catches uncaught errors in any app or component.
 *
 * Without this, a single `throw` in any app (e.g. a bad formula in Spreadsheet,
 * a regex explosion in RegexTester) would crash the entire UbuntuOS shell.
 *
 * Usage: Wrap AppRouter calls inside WindowFrame so a broken app turns into
 * a grey box instead of taking down the whole desktop.
 *
 * @example
 *   <GlobalErrorBoundary>
 *     <AppRouter appId={appId} windowId={win.id} />
 *   </GlobalErrorBoundary>
 */
export default class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for debugging — in production you might send to an error tracker
    // eslint-disable-next-line no-console
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-full w-full gap-3 p-6 text-center"
          style={{ background: 'var(--bg-window)', color: 'var(--text-primary)' }}
        >
          <div className="text-4xl mb-2">⚠️</div>
          <h2 className="text-lg font-semibold">Application Error</h2>
          <p className="text-sm opacity-70 max-w-md">
            This app encountered an unexpected error and cannot continue.
          </p>
          <div className="mt-4 p-3 rounded text-left text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20 max-w-md w-full overflow-auto max-h-40">
            {this.state.error?.toString()}
          </div>
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 rounded text-sm font-medium transition-colors hover:opacity-90"
            style={{ background: 'var(--accent-primary)', color: '#fff' }}
          >
            Restart App
          </button>
          <p className="text-[10px] opacity-50 mt-2">
            If this keeps happening, try closing and reopening the window.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
