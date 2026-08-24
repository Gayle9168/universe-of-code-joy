import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, eyebrow, title, description, action, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-start justify-between gap-4", className)} {...props}>
        <div>
          {eyebrow && <p className="t-mono-label text-primary">{eyebrow}</p>}
          <h2 className="t-h2 text-ink">{title}</h2>
          {description && <p className="t-body text-slate mt-1">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  },
);
SectionHeader.displayName = "SectionHeader";
