import {
  ClerkLoaded,
  ClerkLoading,
  SignIn,
  SignedIn,
  SignedOut,
  useAuth,
} from "@clerk/clerk-react";
import { ArrowLeft, LogIn, Sparkles } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import "./App.css";
import { HabitDashboard } from "./features/habit-dashboard/HabitDashboard";

type DashboardErrorBoundaryProps = {
  children: ReactNode;
};

type DashboardErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class DashboardErrorBoundary extends Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  state: DashboardErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown): DashboardErrorBoundaryState {
    return {
      hasError: true,
      message:
        error instanceof Error
          ? error.message
          : "Das Dashboard konnte nicht geladen werden.",
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error("Dashboard render failed", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="dashboard-error-panel">
          <span className="eyebrow">Dashboard Fehler</span>
          <h1>Das Dashboard konnte nicht geladen werden.</h1>
          <p>{this.state.message}</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Neu laden
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}

function App() {
  const { isSignedIn } = useAuth();
  const [isSignInViewOpen, setIsSignInViewOpen] = useState(false);
  const isAuthScreenOpen = isSignInViewOpen && !isSignedIn;

  return (
    <main className={`app-shell ${isAuthScreenOpen ? "app-shell-auth" : ""}`}>
      <ClerkLoading>
        <section className="auth-loading-panel">
          <span className="eyebrow">Authentifizierung</span>
          <h1>Login wird vorbereitet.</h1>
        </section>
      </ClerkLoading>

      <ClerkLoaded>
        <SignedOut>
          {isAuthScreenOpen ? (
            <section className="auth-clerk-screen">
              <button
                type="button"
                className="ghost-button icon-button auth-back-button"
                onClick={() => setIsSignInViewOpen(false)}
              >
                <ArrowLeft size={17} strokeWidth={2.2} />
                <span>Zurück</span>
              </button>
              <div className="auth-clerk-panel">
                <SignIn
                  fallbackRedirectUrl="/"
                  forceRedirectUrl="/"
                  routing="hash"
                  signUpFallbackRedirectUrl="/"
                  signUpForceRedirectUrl="/"
                  appearance={{
                    elements: {
                      rootBox: "clerk-fullscreen-root",
                      cardBox: "clerk-fullscreen-card-box",
                      card: "clerk-fullscreen-card",
                      main: "clerk-fullscreen-main",
                      footer: "clerk-fullscreen-footer",
                    },
                  }}
                />
              </div>
            </section>
          ) : (
            <section className="auth-panel">
              <div className="auth-content">
                <span className="auth-badge">
                  <Sparkles size={16} strokeWidth={2.2} />
                  Premium Habit Analytics
                </span>
                <h1>Tracke kleine Gewohnheiten mit klarer Wirkung.</h1>
                <p>
                  Melde dich an und sieh direkt, welche Habits heute dran sind,
                  welche Fortschritte wachsen und wo du konsequent bleibst.
                </p>
                <button
                  type="button"
                  className="primary-button auth-button"
                  onClick={() => setIsSignInViewOpen(true)}
                >
                  <LogIn size={18} strokeWidth={2.2} />
                  <span>Anmelden</span>
                </button>
              </div>
              <div className="auth-preview" aria-hidden="true">
                <div className="preview-device">
                  <div className="preview-device-top">
                    <span />
                    <span />
                  </div>
                  <div className="preview-device-hero">
                    <small>Heute im Fokus</small>
                    <strong>Morning Run</strong>
                    <span>1/1 erledigt</span>
                  </div>
                  <div className="preview-device-grid">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="preview-device-list">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </section>
          )}
        </SignedOut>

        <SignedIn>
          <DashboardErrorBoundary>
            <HabitDashboard />
          </DashboardErrorBoundary>
        </SignedIn>
      </ClerkLoaded>
    </main>
  );
}

export default App;
