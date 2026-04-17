import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="mt-2 text-muted-foreground">
                An unexpected error occurred. Please try again.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="mt-4 p-4 rounded-lg bg-muted text-left text-xs overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}>
                <RefreshCw className="h-4 w-4 mr-2" />Reload
              </Button>
              <Button variant="outline" onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}>
                <Home className="h-4 w-4 mr-2" />Home
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
