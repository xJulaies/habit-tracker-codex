import { Sparkles } from "lucide-react";
import { MAX_HABITS } from "../habitDashboard.constants";
import type { Habit } from "../habitDashboard.types";
import { HabitListPanel } from "./HabitListPanel";

type MobileHomePanelProps = {
  habits: Habit[];
  isLoading: boolean;
  selectedHabitId: string | null;
  userName: string;
  onSelectHabit: (habitId: string) => void;
  onStartCreate: () => void;
};

export function MobileHomePanel({
  habits,
  isLoading,
  selectedHabitId,
  userName,
  onSelectHabit,
  onStartCreate,
}: MobileHomePanelProps) {
  return (
    <section className="mobile-home">
      <div className="mobile-greeting">
        <span className="auth-badge">
          <Sparkles size={16} strokeWidth={2.2} />
          Heute im Fokus
        </span>
        <h1>Hallo {userName}</h1>
        <p>
          Wähle ein Habit aus deiner Library und aktualisiere danach Check-ins,
          Fortschritt oder Details.
        </p>
        <span className="slot-pill">{habits.length}/{MAX_HABITS} Habits</span>
      </div>

      <HabitListPanel
        habits={habits}
        isLoading={isLoading}
        selectedHabitId={selectedHabitId}
        onSelectHabit={onSelectHabit}
        onStartCreate={onStartCreate}
      />
    </section>
  );
}
