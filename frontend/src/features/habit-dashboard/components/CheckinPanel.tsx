import { Check, RotateCcw } from "lucide-react";
import {
  formatDate,
  getCheckinCount,
  todayDateKey,
  yesterdayDateKey,
} from "../habitDashboard.helpers";
import type { Habit } from "../habitDashboard.types";

type CheckinPanelProps = {
  selectedHabit: Habit | null;
  onRemoveCheckin: (date: string) => Promise<void>;
  onSetCheckin: (date: string, nextCount: number) => Promise<void>;
};

export function CheckinPanel({
  selectedHabit,
  onRemoveCheckin,
  onSetCheckin,
}: CheckinPanelProps) {
  const renderAction = (date: string, label: string) => {
    const currentCount = getCheckinCount(selectedHabit, date);
    const maxCount = selectedHabit?.plan === "weekly" ? 14 : 1;
    const nextCount = Math.min(currentCount + 1, maxCount);

    return (
      <article className="checkin-row" key={date}>
        <div>
          <span>{label}</span>
          <strong>{currentCount}</strong>
          <small>{formatDate(date)}</small>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="secondary-button icon-button"
            disabled={!selectedHabit || currentCount >= maxCount}
            title="Check-in erhöhen"
            onClick={() => void onSetCheckin(date, nextCount)}
          >
            <Check size={17} strokeWidth={2.4} />
            <span>+1</span>
          </button>
          <button
            type="button"
            className="ghost-button icon-button"
            disabled={!selectedHabit || currentCount === 0}
            title="Check-in zurücksetzen"
            onClick={() => void onRemoveCheckin(date)}
          >
            <RotateCcw size={16} strokeWidth={2.2} />
            <span>Reset</span>
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="checkin-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Heute zuerst</span>
          <h2>Check-ins</h2>
        </div>
        <span className="slot-pill">UTC</span>
      </div>
      {renderAction(todayDateKey(), "Heute")}
      {renderAction(yesterdayDateKey(), "Gestern")}
    </section>
  );
}
