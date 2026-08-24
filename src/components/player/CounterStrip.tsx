import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCounters } from "@/stores/playerStore";
import { useIsReducedMotion } from "@/hooks/useReducedMotionSync";

interface CounterValueProps {
  value: number;
  instant: boolean;
}

function CounterValue({ value, instant }: CounterValueProps): React.ReactElement {
  const source = useMotionValue(value);
  const spring = useSpring(source, { stiffness: 220, damping: 26 });
  const text = useTransform(instant ? source : spring, (v) => Math.round(v).toLocaleString());

  React.useEffect(() => {
    if (instant) source.jump(value);
    else source.set(value);
  }, [value, instant, source]);

  return (
    <motion.span className="font-mono text-base font-semibold tabular-nums text-ink">
      {text}
    </motion.span>
  );
}

export interface CounterStripProps {
  className?: string;
}

export function CounterStrip({ className }: CounterStripProps): React.ReactElement | null {
  const counters = useCounters();
  const reducedMotion = useIsReducedMotion();
  const entries = Object.entries(counters);

  if (entries.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-4", className)}>
      {entries.map(([name, value]) => (
        <li key={name} className="flex min-w-14 flex-col items-start leading-tight">
          <CounterValue value={value} instant={reducedMotion} />
          <span className="t-mono-label text-slate">{name}</span>
        </li>
      ))}
    </ul>
  );
}

export default CounterStrip;
