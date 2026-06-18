import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering crash:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050c09] text-eco-text flex flex-col items-center justify-center p-6 text-center font-jakarta">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-lg shadow-rose-500/5">
            <AlertCircle className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="text-2xl font-outfit font-black text-white mb-3">Something Went Wrong</h2>
          <p className="text-eco-muted text-xs md:text-sm max-w-sm leading-relaxed mb-6">
            EcoTrace encountered an unexpected error while rendering this page. No worries, your local metrics remain safe.
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-5 py-3 bg-eco-green hover:bg-eco-emerald text-white rounded-xl text-xs font-bold font-outfit transition-all shadow-md shadow-eco-green/10 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
