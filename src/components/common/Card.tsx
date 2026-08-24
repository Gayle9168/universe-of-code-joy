import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card border border-hairline rounded-lg shadow-1",
          interactive &&
            "transition hover:shadow-2 hover:-translate-y-0.5 motion-reduce:transform-none cursor-pointer",
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";
