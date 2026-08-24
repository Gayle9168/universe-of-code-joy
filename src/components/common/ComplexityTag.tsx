import * as React from "react";
import { cn } from "@/lib/utils";

export interface ComplexityTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  notation: string;
}

export const ComplexityTag = React.forwardRef<HTMLSpanElement, ComplexityTagProps>(
  ({ className, notation, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full bg-tint px-2.5 py-1 font-mono text-xs text-ink",
          className,
        )}
        {...props}
      >
        {notation}
      </span>
    );
  },
);
ComplexityTag.displayName = "ComplexityTag";
