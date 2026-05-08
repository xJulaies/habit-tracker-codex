import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const habitColors = [
  "gray",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "blue",
  "indigo",
  "violet",
  "purple",
  "pink",
  "rose",
] as const;

type HabitColor = (typeof habitColors)[number];
type HabitPlan = "daily" | "weekly";

type HabitCheckin = {
  date: string;
  count: number;
};

type Habit = {
  _id: string;
  title: string;
  description: string;
  category: string;
  plan: HabitPlan;
  weeklyTarget?: number;
  color: HabitColor;
  checkins: HabitCheckin[];
};

type HabitStats =
  | {
      habitId: string;
      plan: "daily";
      current: {
        type: "daily";
        date: string;
        count: number;
        completed: boolean;
        streak: number;
      };
      totals: HabitTotals;
    }
  | {
      habitId: string;
      plan: "weekly";
      current: {
        type: "weekly";
        startDate: string;
        endDate: string;
        count: number;
        target: number;
        remaining: number;
        completed: boolean;
      };
      totals: HabitTotals;
    };

type HabitTotals = {
  totalCheckins: number;
  checkedInDays: number;
  successRate: number;
};

type ApiAnswer<T> = {
  status: number;
  message: string;
  data: T[];
};

type HabitFormState = {
  title: string;
  description: string;
  category: string;
  plan: HabitPlan;
  weeklyTarget: number;
  color: HabitColor;
};

const initialHabitForm: HabitFormState = {
  title: "",
  description: "",
  category: "",
  plan: "daily",
  weeklyTarget: 3,
  color: "gray",
};

const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);

const todayDateKey = () => toDateKey(new Date());

const yesterdayDateKey = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);

  return toDateKey(date);
};

const formatDate = (dateKey: string): string => {
  const [year, month, day] = dateKey.split("-");

  return `${day}.${month}.${year}`;
};

function App() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedStats, setSelectedStats] = useState<HabitStats | null>(null);
  const [formState, setFormState] = useState<HabitFormState>(initialHabitForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("Bereit");

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit._id === selectedHabitId) || null,
    [habits, selectedHabitId],
  );

  const requestApi = useCallback(
    async <T,>(path: string, options: RequestInit = {}) => {
      const token = await getToken();
      const headers = new Headers(options.headers);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      if (options.body) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers,
      });
      const payload = (await response.json()) as ApiAnswer<T>;

      if (!response.ok) {
        throw new Error(payload.message || "API request failed");
      }

      return payload.data;
    },
    [getToken],
  );

  const loadHabits = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await requestApi<Habit>("/api/habits");
      setHabits(data);
      setSelectedHabitId((currentId) => currentId || data[0]?._id || null);
      setMessage(data.length ? "Habits geladen" : "Noch keine Habits");
    } catch {
      setMessage("Habits konnten nicht geladen werden");
    } finally {
      setIsLoading(false);
    }
  }, [requestApi]);

  const loadStats = useCallback(
    async (habitId: string | null) => {
      if (!habitId) {
        setSelectedStats(null);
        return;
      }

      try {
        const data = await requestApi<HabitStats>(`/api/habits/${habitId}/stats`);
        setSelectedStats(data[0] || null);
      } catch {
        setSelectedStats(null);
        setMessage("Stats konnten nicht geladen werden");
      }
    },
    [requestApi],
  );

  useEffect(() => {
    if (!isSignedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHabits([]);
      setSelectedHabitId(null);
      setSelectedStats(null);
      return;
    }

    // Initial API sync after Clerk has mounted.
    void loadHabits();
  }, [isSignedIn, loadHabits]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    // Keep stats aligned with the selected habit.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStats(selectedHabitId);
  }, [isSignedIn, loadStats, selectedHabitId]);

  const createHabit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const body =
      formState.plan === "weekly"
        ? formState
        : {
            title: formState.title,
            description: formState.description,
            category: formState.category,
            plan: formState.plan,
            color: formState.color,
          };

    try {
      const data = await requestApi<Habit>("/api/habits", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const createdHabit = data[0];

      setHabits((currentHabits) => [createdHabit, ...currentHabits]);
      setSelectedHabitId(createdHabit._id);
      setFormState(initialHabitForm);
      setMessage("Habit erstellt");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Habit konnte nicht erstellt werden");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      await requestApi<Habit>(`/api/habits/${habitId}`, { method: "DELETE" });
      const remainingHabits = habits.filter((habit) => habit._id !== habitId);

      setHabits(remainingHabits);
      setSelectedHabitId((currentId) =>
        currentId === habitId ? remainingHabits[0]?._id || null : currentId,
      );
      setMessage("Habit geloescht");
    } catch {
      setMessage("Habit konnte nicht geloescht werden");
    }
  };

  const setCheckin = async (date: string, nextCount: number) => {
    if (!selectedHabit) {
      return;
    }

    try {
      const data = await requestApi<Habit>(
        `/api/habits/${selectedHabit._id}/checkins/${date}`,
        {
          method: "PUT",
          body: JSON.stringify({ count: nextCount }),
        },
      );
      const updatedHabit = data[0];

      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit._id === updatedHabit._id ? updatedHabit : habit,
        ),
      );
      await loadStats(updatedHabit._id);
      setMessage("Check-in aktualisiert");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Check-in fehlgeschlagen");
    }
  };

  const removeCheckin = async (date: string) => {
    if (!selectedHabit) {
      return;
    }

    try {
      const data = await requestApi<Habit>(
        `/api/habits/${selectedHabit._id}/checkins/${date}`,
        { method: "DELETE" },
      );
      const updatedHabit = data[0];

      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit._id === updatedHabit._id ? updatedHabit : habit,
        ),
      );
      await loadStats(updatedHabit._id);
      setMessage("Check-in entfernt");
    } catch {
      setMessage("Check-in konnte nicht entfernt werden");
    }
  };

  const getCheckinCount = (date: string) => {
    return selectedHabit?.checkins.find((checkin) => checkin.date === date)?.count || 0;
  };

  const renderCheckinAction = (date: string) => {
    const currentCount = getCheckinCount(date);
    const maxCount = selectedHabit?.plan === "weekly" ? 14 : 1;
    const nextCount = Math.min(currentCount + 1, maxCount);

    return (
      <div className="checkin-row" key={date}>
        <div>
          <span>{formatDate(date)}</span>
          <strong>{currentCount}</strong>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="secondary-button"
            disabled={!selectedHabit || currentCount >= maxCount}
            onClick={() => void setCheckin(date, nextCount)}
          >
            +1
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={!selectedHabit || currentCount === 0}
            onClick={() => void removeCheckin(date)}
          >
            Reset
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Habit Tracker</span>
          <h1>{user?.firstName ? `Hallo ${user.firstName}` : "Dashboard"}</h1>
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <SignedOut>
        <section className="auth-panel">
          <div className="auth-copy">
            <h2>Anmelden</h2>
            <p>Nach dem Login kannst du deine Habits erstellen und tracken.</p>
          </div>
          <SignInButton mode="modal">
            <button type="button" className="primary-button">
              Sign in
            </button>
          </SignInButton>
        </section>
      </SignedOut>

      <SignedIn>
        <section className="dashboard-grid">
          <aside className="sidebar">
            <div className="section-heading">
              <h2>Habits</h2>
              <span>{habits.length}/5</span>
            </div>

            <form className="habit-form" onSubmit={(event) => void createHabit(event)}>
              <label>
                Titel
                <input
                  required
                  maxLength={80}
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Kategorie
                <input
                  required
                  maxLength={40}
                  value={formState.category}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Beschreibung
                <textarea
                  maxLength={300}
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="field-grid">
                <label>
                  Plan
                  <select
                    value={formState.plan}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        plan: event.target.value as HabitPlan,
                      }))
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </label>

                {formState.plan === "weekly" ? (
                  <label>
                    Ziel
                    <input
                      min={1}
                      max={14}
                      type="number"
                      value={formState.weeklyTarget}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          weeklyTarget: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                ) : null}
              </div>

              <div className="color-grid" aria-label="Farbe">
                {habitColors.map((color) => (
                  <button
                    type="button"
                    className={`color-swatch color-${color}`}
                    data-selected={formState.color === color}
                    key={color}
                    onClick={() =>
                      setFormState((current) => ({
                        ...current,
                        color,
                      }))
                    }
                  >
                    <span>{color}</span>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="primary-button full-width"
                disabled={isSaving || habits.length >= 5}
              >
                {isSaving ? "Speichert..." : "Habit erstellen"}
              </button>
            </form>

            <div className="habit-list" aria-busy={isLoading}>
              {habits.map((habit) => (
                <button
                  type="button"
                  className="habit-list-item"
                  data-active={habit._id === selectedHabitId}
                  key={habit._id}
                  onClick={() => setSelectedHabitId(habit._id)}
                >
                  <span className={`habit-dot color-${habit.color}`} />
                  <span>
                    <strong>{habit.title}</strong>
                    <small>
                      {habit.category} - {habit.plan}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="detail-panel">
            {selectedHabit ? (
              <>
                <div className="detail-header">
                  <div>
                    <span className="eyebrow">{selectedHabit.category}</span>
                    <h2>{selectedHabit.title}</h2>
                    {selectedHabit.description ? (
                      <p>{selectedHabit.description}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => void deleteHabit(selectedHabit._id)}
                  >
                    Loeschen
                  </button>
                </div>

                <div className="stats-grid">
                  <div className="stat-item">
                    <span>Status</span>
                    <strong>
                      {selectedStats?.current.completed ? "Erledigt" : "Offen"}
                    </strong>
                  </div>
                  <div className="stat-item">
                    <span>
                      {selectedStats?.plan === "weekly" ? "Woche" : "Streak"}
                    </span>
                    <strong>
                      {selectedStats?.plan === "weekly"
                        ? `${selectedStats.current.count}/${selectedStats.current.target}`
                        : selectedStats?.current.streak || 0}
                    </strong>
                  </div>
                  <div className="stat-item">
                    <span>Erfolg</span>
                    <strong>{selectedStats?.totals.successRate || 0}%</strong>
                  </div>
                </div>

                <div className="checkin-panel">
                  <div className="section-heading">
                    <h2>Check-ins</h2>
                    <span>UTC</span>
                  </div>
                  {renderCheckinAction(todayDateKey())}
                  {renderCheckinAction(yesterdayDateKey())}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h2>Kein Habit ausgewaehlt</h2>
                <p>Erstelle links dein erstes Habit.</p>
              </div>
            )}
          </section>
        </section>

        <p className="status-line">{message}</p>
      </SignedIn>
    </main>
  );
}

export default App;
