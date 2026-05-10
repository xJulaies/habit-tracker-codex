import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
};

export function MetricCard({ icon: Icon, label, value, hint }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2.1} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}
