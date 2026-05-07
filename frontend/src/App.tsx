import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import { useState } from "react";
import "./App.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [apiStatus, setApiStatus] = useState("Nicht geprueft");
  const [isCheckingApi, setIsCheckingApi] = useState(false);

  const checkApi = async () => {
    setIsCheckingApi(true);
    setApiStatus("Pruefe Backend...");

    try {
      const token = await getToken();
      const response = await fetch(`${apiUrl}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = (await response.json()) as { message?: string };

      setApiStatus(
        response.ok ? data.message || "Backend erreichbar" : "Backend Fehler",
      );
    } catch {
      setApiStatus("Backend nicht erreichbar");
    } finally {
      setIsCheckingApi(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Backend API Codex</span>
          <h1>Clerk Auth</h1>
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <section className="auth-panel">
        <SignedOut>
          <div className="auth-copy">
            <h2>Anmelden</h2>
            <p>Verbinde das Frontend mit deiner Clerk Application.</p>
          </div>
          <SignInButton mode="modal">
            <button type="button" className="primary-button">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="auth-copy">
            <h2>{user?.firstName ? `Hallo ${user.firstName}` : "Angemeldet"}</h2>
            <p>
              Clerk ist aktiv. API-Requests koennen jetzt mit Session Token
              gesendet werden.
            </p>
          </div>
          <button
            type="button"
            className="primary-button"
            disabled={!isSignedIn || isCheckingApi}
            onClick={checkApi}
          >
            {isCheckingApi ? "Pruefe..." : "Backend pruefen"}
          </button>
        </SignedIn>
      </section>

      <section className="status-grid">
        <div className="status-item">
          <span>Frontend</span>
          <strong>Vite + React</strong>
        </div>
        <div className="status-item">
          <span>Auth</span>
          <strong>Clerk vorbereitet</strong>
        </div>
        <div className="status-item">
          <span>API</span>
          <strong>{apiStatus}</strong>
        </div>
      </section>
    </main>
  );
}

export default App;
