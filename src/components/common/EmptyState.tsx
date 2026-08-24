import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center text-center gap-3 p-8", className)}
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tint">
          <Icon className="text-primary" size={22} aria-hidden="true" />
        </div>
        <p className="t-h3 text-ink">{title}</p>
        {description && <p className="t-body text-slate max-w-sm">{description}</p>}
        {action && (
          <Button variant="secondary" size="sm" onClick={action.onClick} className="mt-1">
            {action.label}
          </Button>
        )}
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";
