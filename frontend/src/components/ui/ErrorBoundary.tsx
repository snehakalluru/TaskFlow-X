import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import ErrorState from './ErrorState';

export default class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }

  componentDidCatch() {
    // keep console clean; toasts can be added later if desired
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Something went wrong"
          description={this.state.message || 'An unexpected error occurred.'}
        />
      );
    }

    return this.props.children;
  }
}

