import * as React from "react";
import { cn } from "@/lib/utils";

export type ChipTone = "neutral" | "accent" | "warning" | "error" | "success";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
}

const toneClasses: Record<ChipTone, string> = {
  neutral: "bg-tint text-slate",
  accent: "bg-tint text-primary",
  warning: "bg-warning-tint text-warning",
  error: "bg-error-tint text-error",
  success: "bg-tint text-primary",
};

export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, tone = "neutral", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "t-mono-label inline-flex items-center rounded-full px-2 py-0.5 uppercase",
          toneClasses[tone],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);
Chip.displayName = "Chip";
