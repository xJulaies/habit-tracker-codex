import { ListChecks } from "lucide-react";
import type { CSSProperties } from "react";
import { habitAccentByColor, MAX_HABITS } from "../habitDashboard.constants";
import type { Habit } from "../habitDashboard.types";

type HabitListPanelProps = {
  habits: Habit[];
  isLoading: boolean;
  selectedHabitId: string | null;
  onSelectHabit: (habitId: string) => void;
  onStartCreate: () => void;
};

const getHabitStyle = (habit: Habit): CSSProperties => {
  return {
    "--habit-accent": habitAccentByColor[habit.color],
  } as CSSProperties;
};

export function HabitListPanel({
  habits,
  isLoading,
  selectedHabitId,
  onSelectHabit,
  onStartCreate,
}: HabitListPanelProps) {
  return (
    <section className="habit-list-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Library</span>
          <h2>Habits</h2>
        </div>
        <span className="slot-pill">{habits.length}/{MAX_HABITS}</span>
      </div>

      {habits.length === 0 && !isLoading ? (
        <div className="empty-panel">
          <div className="empty-icon" aria-hidden="true">
            <ListChecks size={22} strokeWidth={2.1} />
          </div>
          <h3>Dein erstes Habit wartet</h3>
          <p>Lege ein kleines Ziel an und tracke direkt heute den ersten Schritt.</p>
          <button type="button" className="secondary-button" onClick={onStartCreate}>
            Neues Habit
          </button>
        </div>
      ) : null}

      <div className="habit-list" aria-busy={isLoading}>
        {habits.map((habit) => (
          <button
            type="button"
            className="habit-list-item"
            style={getHabitStyle(habit)}
            data-active={habit._id === selectedHabitId}
            key={habit._id}
            onClick={() => onSelectHabit(habit._id)}
          >
            <span className="habit-dot" />
            <span>
              <strong>{habit.title}</strong>
              <small>
                {habit.category} · {habit.plan}
              </small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
