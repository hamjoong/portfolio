import { Component, type ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다.</h2>
            <p className="text-gray-700 mb-6">죄송합니다. 페이지를 표시하는 중 문제가 발생했습니다.</p>
            <p className="text-gray-500 text-sm mb-4">
              {this.state.error?.message && `오류 메시지: ${this.state.error.message}`}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
