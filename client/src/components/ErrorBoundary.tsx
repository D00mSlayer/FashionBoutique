import React, { Component, ErrorInfo, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in the component tree,
 * log those errors, and display a fallback UI.
 * It also reports the errors to our backend for email notification.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report the error to our backend API
    this.reportError(error, errorInfo);
  }

  // Send the error to our backend API for email notification
  private reportError = async (error: Error, errorInfo: ErrorInfo): Promise<void> => {
    try {
      await apiRequest({
        method: 'POST',
        path: '/api/error-report',
        data: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'json'
      });
      console.log('Error reported to server');
    } catch (reportError) {
      console.error('Failed to report error to server:', reportError);
    }
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary mb-4">Something went wrong</h2>
            <p className="mb-6">We apologize for the inconvenience. Our team has been notified of this issue.</p>
            <div className="overflow-hidden rounded-md bg-muted p-4 mb-6 max-h-40 overflow-y-auto">
              <p className="text-sm font-mono whitespace-pre-wrap text-left">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}