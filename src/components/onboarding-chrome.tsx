import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AlgoraGlyph } from "@/components/site-chrome";

type StepState = "complete" | "active" | "upcoming";

const STEPS = ["Goals", "Assessment", "Your path"];

export function OnboardingTopBar({
  current,
  right,
}: {
  current: 1 | 2 | 3;
  right: React.ReactNode;
}) {
  return (
    <header className="shrink-0 border-b border-hairline bg-card">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-8">
        <Link to="/" className="flex items-center gap-2">
          <AlgoraGlyph />
          <span className="font-mono text-[22px] font-medium tracking-tight text-foreground">
            algora
          </span>
        </Link>

        <nav aria-label="Onboarding progress" className="flex items-center gap-3">
          {STEPS.map((label, i) => {
            const index = (i + 1) as 1 | 2 | 3;
            const state: StepState =
              index < current ? "complete" : index === current ? "active" : "upcoming";
            return (
              <div
                key={label}
                aria-current={state === "active" ? "step" : undefined}
                className="flex items-center gap-3"
              >
                {i > 0 && <span className="h-px w-14 bg-hairline" />}
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[12px]",
                      state === "upcoming"
                        ? "border border-hairline bg-card text-muted-foreground"
                        : "bg-primary text-primary-foreground",
                    ].join(" ")}
                  >
                    {state === "complete" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      index
                    )}
                  </span>
                  <span
                    className={[
                      "font-mono text-[14px]",
                      state === "active" ? "text-primary" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {state === "complete" ? `${index} ${label}` : label}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="font-mono text-[13px] text-muted-foreground">{right}</div>
      </div>
    </header>
  );
}

export function OnboardingFooter({ middle }: { middle: string }) {
  return (
    <footer className="flex h-[48px] shrink-0 items-center justify-center">
      <p className="font-mono text-[12px] text-muted-foreground">
        © 2026 Algora &nbsp;·&nbsp; {middle} &nbsp;·&nbsp; Reduced-motion friendly
      </p>
    </footer>
  );
}

export function StepBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-primary-tint px-3 py-1.5 font-mono text-[11px] tracking-wider text-primary">
      <span className="text-[9px]">◆</span> {children}
    </span>
  );
}

export function TealPeriod() {
  return <span className="ml-0.5 inline-block h-2.5 w-2.5 bg-primary align-baseline" />;
}
