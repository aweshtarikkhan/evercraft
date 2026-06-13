import React, { Component, ErrorInfo, ReactNode } from "react";

export class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 40, background: "#fee2e2", color: "#991b1b", minHeight: "100vh"}}>
          <h2>Something went wrong in the component.</h2>
          <pre style={{whiteSpace: "pre-wrap", background: "#fecaca", padding: 10, borderRadius: 8}}>{this.state.error?.toString()}</pre>
          <br/>
          <pre style={{whiteSpace: "pre-wrap", fontSize: 12}}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}