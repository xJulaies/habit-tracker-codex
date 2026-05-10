import { UserButton, useAuth, useUser } from "@clerk/clerk-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { initialHabitForm } from "./habitDashboard.constants";
import type {
  ApiAnswer,
  Habit,
  HabitFormState,
  HabitStats,
  MobileDashboardTab,
} from "./habitDashboard.types";
import { DashboardOverview } from "./components/DashboardOverview";
import { HabitDetailPanel } from "./components/HabitDetailPanel";
import { HabitFormPanel } from "./components/HabitFormPanel";
import { HabitListPanel } from "./components/HabitListPanel";
import { MobileTabBar } from "./components/MobileTabBar";
import { MobileHomePanel } from "./components/MobileHomePanel";
import { ProfilePanel } from "./components/ProfilePanel";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function HabitDashboard() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedStats, setSelectedStats] = useState<HabitStats | null>(null);
  const [formState, setFormState] = useState<HabitFormState>(initialHabitForm);
  const [activeMobileTab, setActiveMobileTab] =
    useState<MobileDashboardTab>("home");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("Bereit");

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit._id === selectedHabitId) || null,
    [habits, selectedHabitId],
  );

  const selectedSuccessRate = selectedStats?.totals.successRate || 0;
  const userName = user?.firstName || user?.fullName || "du";
  const visibleStatusMessage = [
    "Bereit",
    "Habits geladen",
    "Noch keine Habits",
  ].includes(message)
    ? ""
    : message;

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
      setSelectedHabitId((currentId) => {
        if (currentId && data.some((habit) => habit._id === currentId)) {
          return currentId;
        }

        return data[0]?._id || null;
      });
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

    void loadHabits();
  }, [isSignedIn, loadHabits]);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStats(selectedHabitId);
  }, [isSignedIn, loadStats, selectedHabitId]);

  const startCreate = () => {
    setIsCreateOpen(true);
    setIsMobileDetailOpen(false);
    setActiveMobileTab("create");
  };

  const changeMobileTab = (tab: MobileDashboardTab) => {
    setActiveMobileTab(tab);

    if (tab === "home") {
      setIsMobileDetailOpen(false);
      return;
    }

    setIsMobileDetailOpen(false);
  };

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
      setIsCreateOpen(false);
      setIsMobileDetailOpen(true);
      setActiveMobileTab("home");
      setMessage("Habit erstellt");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Habit konnte nicht erstellt werden",
      );
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
      setIsMobileDetailOpen(false);
      setMessage("Habit gelöscht");
    } catch {
      setMessage("Habit konnte nicht gelöscht werden");
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

  const desktopFormPanel = (
    <HabitFormPanel
      formState={formState}
      habitCount={habits.length}
      isOpen={isCreateOpen}
      isSaving={isSaving}
      onChangeFormState={setFormState}
      onSubmit={createHabit}
      onToggle={() => setIsCreateOpen((current) => !current)}
    />
  );

  const mobileFormPanel = (
    <HabitFormPanel
      formState={formState}
      habitCount={habits.length}
      isOpen={true}
      isSaving={isSaving}
      onChangeFormState={setFormState}
      onSubmit={createHabit}
      onToggle={() => changeMobileTab("home")}
    />
  );

  const listPanel = (
    <HabitListPanel
      habits={habits}
      isLoading={isLoading}
      selectedHabitId={selectedHabitId}
      onSelectHabit={(habitId) => {
        setSelectedHabitId(habitId);
        setIsMobileDetailOpen(true);
        setActiveMobileTab("home");
      }}
      onStartCreate={startCreate}
    />
  );

  const desktopDetailPanel = (
    <HabitDetailPanel
      selectedHabit={selectedHabit}
      selectedStats={selectedStats}
      onDeleteHabit={deleteHabit}
      onRemoveCheckin={removeCheckin}
      onSetCheckin={setCheckin}
      onStartCreate={startCreate}
    />
  );

  const mobileDetailPanel = (
    <HabitDetailPanel
      selectedHabit={selectedHabit}
      selectedStats={selectedStats}
      onDeleteHabit={deleteHabit}
      onRemoveCheckin={removeCheckin}
      onSetCheckin={setCheckin}
      onStartCreate={startCreate}
      onBackToLibrary={() => setIsMobileDetailOpen(false)}
    />
  );

  const mobileHomePanel = (
    <MobileHomePanel
      habits={habits}
      isLoading={isLoading}
      selectedHabitId={selectedHabitId}
      userName={userName}
      onSelectHabit={(habitId) => {
        setSelectedHabitId(habitId);
        setIsMobileDetailOpen(true);
      }}
      onStartCreate={startCreate}
    />
  );

  return (
    <>
      <header className="topbar desktop-topbar">
        <div>
          <span className="eyebrow">Habit Tracker</span>
          <h1>{user?.firstName ? `Hallo ${user.firstName}` : "Dashboard"}</h1>
        </div>
        <UserButton />
      </header>

      <section className="mobile-dashboard">
        {activeMobileTab === "home"
          ? isMobileDetailOpen
            ? mobileDetailPanel
            : mobileHomePanel
          : null}
        {activeMobileTab === "create" ? mobileFormPanel : null}
        {activeMobileTab === "profile" ? <ProfilePanel /> : null}
      </section>

      <section className="desktop-dashboard">
        <div className="dashboard-main">
          <DashboardOverview
            habits={habits}
            selectedSuccessRate={selectedSuccessRate}
          />
          {desktopDetailPanel}
        </div>
        <aside className="dashboard-rail">
          {desktopFormPanel}
          {listPanel}
        </aside>
      </section>

      {visibleStatusMessage ? (
        <p className="status-line">{visibleStatusMessage}</p>
      ) : null}

      <MobileTabBar activeTab={activeMobileTab} onChangeTab={changeMobileTab} />
    </>
  );
}
