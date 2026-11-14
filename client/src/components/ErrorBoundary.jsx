import { Component } from 'react';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl max-w-md">
            <span className="text-4xl">⚠️</span>
            <h2 className="mt-4 font-serif text-2xl font-bold text-slate-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              An unexpected error occurred in the user interface. You can reload the application safely.
            </p>
            <div className="mt-6 flex justify-center">
              <Button onClick={this.handleReload}>
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

