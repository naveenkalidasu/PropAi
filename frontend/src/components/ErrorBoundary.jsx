import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div class="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <div class="p-4 rounded-full bg-red-100 dark:bg-red-950/20 text-red-500 mb-4">
            <AlertCircle size={40} />
          </div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Something went wrong</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
            An unexpected error occurred in this view. Try reloading or return to the dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            class="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-sm transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
