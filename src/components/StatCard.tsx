
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  detail: string;
  icon: ReactNode;
  trend: string;
  positive: boolean;
}

export default function StatCard({
  label,
  value,
  detail,
  icon,
  trend,
  positive,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>
        <div className="stat-icon">{icon}</div>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        <span className={positive ? "trend-positive" : "trend-warning"}>
          {positive ? (
            <ArrowUpRight size={15} />
          ) : (
            <ArrowDownRight size={15} />
          )}
          {trend}
        </span>
        <span>{detail}</span>
      </div>
    </article>
  );
}
