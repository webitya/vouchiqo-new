"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component } from "react";
import { Button } from "@/components/ui/button";

/**
 * React Error Boundary — catches any uncaught render errors in child tree
 * and renders a friendly fallback instead of a blank white screen.
 *
 * @example
 * <ErrorBoundary>
 *   <SomeRiskyComponent />
 * </ErrorBoundary>
 *
 * @example — custom fallback
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <SomeRiskyComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Optionally wire to an error reporting service here
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-brand-bg rounded-lg border border-brand-border my-6">
          <div className="p-3 rounded-full bg-red-50 border border-red-100 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-heading text-base font-bold text-brand-text mb-1">
            Something went wrong
          </h3>
          <p className="text-xs text-brand-subtext mb-5 max-w-xs leading-relaxed">
            {this.state.error?.message ||
              "An unexpected error occurred. Please try refreshing the page."}
          </p>
          <Button
            onClick={this.handleReset}
            className="flex items-center gap-2 text-xs bg-brand-navy text-white hover:bg-brand-navy/90 shadow-none h-auto px-4 py-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
