import * as React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/common/Card";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  delta?: number;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, delta, ...props }, ref) => {
    const isPositive = typeof delta === "number" && delta >= 0;
    return (
      <Card ref={ref} className={cn("p-4", className)} {...props}>
        <p className="t-mono-label text-slate-soft">{label}</p>
        <p className="t-h2 text-ink mt-1">{value}</p>
        {typeof delta === "number" && (
          <div
            className={cn(
              "mt-2 inline-flex items-center gap-1 t-small font-mono",
              isPositive ? "text-primary" : "text-error",
            )}
          >
            {isPositive ? (
              <ArrowUp size={14} aria-hidden="true" />
            ) : (
              <ArrowDown size={14} aria-hidden="true" />
            )}
            <span>{Math.abs(delta)}%</span>
          </div>
        )}
      </Card>
    );
  },
);
StatCard.displayName = "StatCard";
