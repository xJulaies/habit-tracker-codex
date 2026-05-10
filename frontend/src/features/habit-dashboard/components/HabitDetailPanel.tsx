import { ArrowLeft, BarChart3, Flame, Target, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { habitAccentByColor } from "../habitDashboard.constants";
import type { Habit, HabitStats } from "../habitDashboard.types";
import { CheckinPanel } from "./CheckinPanel";
import { MetricCard } from "./MetricCard";

type HabitDetailPanelProps = {
  selectedHabit: Habit | null;
  selectedStats: HabitStats | null;
  onDeleteHabit: (habitId: string) => Promise<void>;
  onRemoveCheckin: (date: string) => Promise<void>;
  onSetCheckin: (date: string, nextCount: number) => Promise<void>;
  onStartCreate: () => void;
  onBackToLibrary?: () => void;
};

const getHabitStyle = (habit: Habit | null): CSSProperties => {
  return {
    "--habit-accent": habit ? habitAccentByColor[habit.color] : "#22d3ee",
  } as CSSProperties;
};

const getProgressValue = (stats: HabitStats | null): string => {
  if (!stats) {
    return "0";
  }

  if (stats.plan === "weekly") {
    return `${stats.current.count}/${stats.current.target}`;
  }

  return String(stats.current.streak);
};

const getProgressLabel = (stats: HabitStats | null): string => {
  return stats?.plan === "weekly" ? "Woche" : "Streak";
};

export function HabitDetailPanel({
  selectedHabit,
  selectedStats,
  onDeleteHabit,
  onRemoveCheckin,
  onSetCheckin,
  onStartCreate,
  onBackToLibrary,
}: HabitDetailPanelProps) {
  if (!selectedHabit) {
    return (
      <section className="detail-panel empty-detail">
        <div className="empty-panel">
          <div className="empty-icon" aria-hidden="true">
            <Target size={24} strokeWidth={2.1} />
          </div>
          <h2>Starte mit einem kleinen Ziel</h2>
          <p>Erstelle dein erstes Habit und mach den heutigen Fortschritt sichtbar.</p>
          <button type="button" className="primary-button" onClick={onStartCreate}>
            Neues Habit
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="detail-panel" style={getHabitStyle(selectedHabit)}>
      {onBackToLibrary ? (
        <button
          type="button"
          className="ghost-button icon-button mobile-back-button"
          onClick={onBackToLibrary}
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>Library</span>
        </button>
      ) : null}

      <div className="detail-hero">
        <div>
          <span className="eyebrow">{selectedHabit.category}</span>
          <h1>{selectedHabit.title}</h1>
          {selectedHabit.description ? <p>{selectedHabit.description}</p> : null}
        </div>
        <button
          type="button"
          className="danger-button icon-button"
          onClick={() => void onDeleteHabit(selectedHabit._id)}
        >
          <Trash2 size={16} strokeWidth={2.1} />
          <span>Löschen</span>
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard
          icon={Target}
          label="Status"
          value={selectedStats?.current.completed ? "Erledigt" : "Offen"}
          hint="aktueller Zeitraum"
        />
        <MetricCard
          icon={Flame}
          label={getProgressLabel(selectedStats)}
          value={getProgressValue(selectedStats)}
          hint={selectedStats?.plan === "weekly" ? "diese Woche" : "Tage in Folge"}
        />
        <MetricCard
          icon={BarChart3}
          label="Erfolg"
          value={`${selectedStats?.totals.successRate || 0}%`}
          hint="seit Erstellung"
        />
      </div>

      <CheckinPanel
        selectedHabit={selectedHabit}
        onRemoveCheckin={onRemoveCheckin}
        onSetCheckin={onSetCheckin}
      />
    </section>
  );
}
