import { useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Download } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar, AppWorkspaceBar } from "@/components/app-shell";
import { SettingsNav } from "@/components/settings-nav";
import useHydrated from "@/hooks/useHydrated";
import type { BillingPlan } from "@/stores/prefsStore";
import { usePrefsStore } from "@/stores/prefsStore";
import { baselineProgress, useProgressStore } from "@/stores/progressStore";

export const Route = createFileRoute("/settings/billing")({
  component: Billing,
  head: () => ({
    meta: [
      { title: "Subscription & billing — Algora" },
      {
        name: "description",
        content:
          "Manage your Algora plan and payment details: view your current subscription, payment method, invoice history and usage this cycle.",
      },
      { property: "og:title", content: "Subscription & billing — Algora" },
      {
        property: "og:description",
        content: "Change your plan, update payment details and download past invoices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const INVOICES = [
  { id: "INV-2041", date: "Mar 3 2025", amount: "$96.00" },
  { id: "INV-1938", date: "Mar 3 2024", amount: "$96.00" },
  { id: "INV-1835", date: "Mar 3 2023", amount: "$96.00" },
  { id: "INV-1732", date: "Mar 3 2022", amount: "$96.00" },
];

const PLAN_LABELS: Record<
  BillingPlan,
  { label: string; badge: string; price: string; cycle: string }
> = {
  free: { label: "Free", badge: "Free", price: "$0", cycle: "forever" },
  "pro-monthly": { label: "Pro — Monthly", badge: "Pro", price: "$12", cycle: "/ month" },
  "pro-annual": { label: "Pro — Annual", badge: "Pro", price: "$96", cycle: "/ year" },
};

function CardGlyph() {
  return (
    <svg viewBox="0 0 52 34" className="h-[34px] w-[52px]" aria-hidden="true">
      <rect
        x="0.75"
        y="0.75"
        width="50.5"
        height="32.5"
        rx="5.25"
        fill="var(--card)"
        stroke="var(--viz-edge)"
        strokeWidth="1.5"
      />
      <rect x="0.75" y="8" width="50.5" height="6" fill="var(--tint)" />
      <rect x="6" y="21" width="18" height="3" rx="1.5" fill="var(--viz-edge)" />
      <rect x="28" y="21" width="8" height="3" rx="1.5" fill="var(--hairline)" />
    </svg>
  );
}

function UsageRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] text-foreground">{label}</span>
        <span className="font-mono text-[13px] text-foreground">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Billing() {
  const hydrated = useHydrated();
  const billingPlan = usePrefsStore((s) => s.billingPlan);
  const setBillingPlan = usePrefsStore((s) => s.setBillingPlan);
  const progress = useProgressStore((s) => (hydrated ? s : baselineProgress));

  /* Derive usage from real store data */
  const activePaths = useMemo(() => {
    if (!hydrated) return 0;
    return progress.activePathSlug ? 1 : 0;
  }, [hydrated, progress.activePathSlug]);

  const totalSteps = useMemo(() => {
    if (!hydrated) return 0;
    return Object.values(progress.algorithms).reduce((sum, a) => sum + a.stepsWatched, 0);
  }, [hydrated, progress.algorithms]);

  const planInfo = PLAN_LABELS[hydrated ? billingPlan : "pro-annual"];
  const isPro = hydrated ? billingPlan !== "free" : true;

  const handleChangePlan = useCallback(() => {
    const next: BillingPlan = billingPlan === "free" ? "pro-annual" : "free";
    setBillingPlan(next);
    toast.success(next === "free" ? "Downgraded to Free" : "Upgraded to Pro Annual");
  }, [billingPlan, setBillingPlan]);

  const handleCancel = useCallback(() => {
    setBillingPlan("free");
    toast.success("Subscription cancelled — downgraded to Free");
  }, [setBillingPlan]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar active="Settings" collapsible />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppWorkspaceBar crumbs={["Settings", "Billing"]} search />

        <main className="flex min-h-0 flex-1 gap-5 overflow-hidden px-8 py-5">
          <SettingsNav active="Billing" />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <h1 className="text-[26px] font-semibold leading-none tracking-tight text-foreground">
              Subscription &amp; billing
            </h1>
            <p className="mt-2 font-mono text-[13px] text-muted-foreground">
              Manage your plan and payment details.
            </p>

            {/* Current plan */}
            <div className="relative mt-3.5 shrink-0 overflow-hidden rounded-2xl border border-hairline bg-card py-4 pl-7 pr-6">
              <span className="absolute left-0 top-0 h-full w-[4px] bg-primary" />
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-primary px-2.5 py-1 font-mono text-[13px] text-primary-foreground">
                      {planInfo.badge}
                    </span>
                    <span className="text-[19px] font-semibold text-foreground">
                      {planInfo.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="font-mono text-[30px] font-medium leading-none text-foreground">
                      {planInfo.price}
                    </span>
                    <span className="font-mono text-[14px] text-muted-foreground">
                      {planInfo.cycle}
                    </span>
                    {isPro && (
                      <>
                        <span className="mx-3 h-5 w-px bg-hairline" />
                        <span className="font-mono text-[13px] text-muted-foreground">
                          renews Mar 3, 2026
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-3 font-mono text-[12.5px] text-muted-foreground">
                    {isPro
                      ? "Unlimited paths · All visualizers · Priority review"
                      : "3 algorithms · 1 path · Community support"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <button
                    onClick={handleChangePlan}
                    className="h-11 rounded-xl border border-hairline bg-card px-5 font-sans text-[14px] text-foreground hover:bg-secondary"
                  >
                    {isPro ? "Change plan" : "Upgrade to Pro"}
                  </button>
                  {isPro && (
                    <div className="mt-3">
                      <button
                        onClick={handleCancel}
                        className="font-sans text-[13.5px] text-primary hover:underline"
                      >
                        Cancel subscription
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex min-h-0 flex-1 gap-4">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
                {/* Payment method */}
                <div className="shrink-0 rounded-2xl border border-hairline bg-card px-6 py-4">
                  <h2 className="text-[17px] font-semibold text-foreground">Payment method</h2>
                  <div className="mt-4 flex items-center gap-4">
                    <CardGlyph />
                    <div className="min-w-0">
                      <div className="font-mono text-[15px] text-foreground">•••• 4242</div>
                      <div className="mt-0.5 font-mono text-[12.5px] text-muted-foreground">
                        Visa · exp 08/27
                      </div>
                    </div>
                    <span className="ml-auto rounded-md bg-primary-tint px-2.5 py-1 font-mono text-[11.5px] text-primary">
                      Default
                    </span>
                    <button className="h-10 rounded-xl border border-hairline bg-card px-5 font-sans text-[14px] text-foreground hover:bg-secondary">
                      Update
                    </button>
                  </div>
                </div>

                {/* Billing history */}
                <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-hairline bg-card px-6 py-5">
                  <h2 className="text-[17px] font-semibold text-foreground">Billing history</h2>
                  <table className="mt-3 w-full border-collapse">
                    <thead>
                      <tr className="border-b border-hairline">
                        {["Invoice", "Date", "Amount", "Status", ""].map((h, i) => (
                          <th
                            key={h || "act"}
                            className={`pb-2.5 font-mono text-[12px] font-normal text-muted-foreground ${
                              i === 4 ? "text-right" : "text-left"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {INVOICES.map((inv) => (
                        <tr key={inv.id} className="border-b border-hairline last:border-0">
                          <td className="py-2 font-mono text-[13px] text-foreground">{inv.id}</td>
                          <td className="py-2 font-mono text-[13px] text-muted-foreground">
                            {inv.date}
                          </td>
                          <td className="py-2 font-mono text-[13px] text-foreground">
                            {inv.amount}
                          </td>
                          <td className="py-2">
                            <span className="rounded-md bg-primary-tint px-2.5 py-1 font-mono text-[11.5px] text-primary">
                              Paid
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            <button className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-primary hover:underline">
                              PDF <Download className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="mx-auto mt-auto inline-flex items-center gap-2 pt-3 font-mono text-[13px] text-primary hover:underline">
                    View all invoices <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Usage rail — driven from real store data */}
              <aside className="w-[320px] shrink-0 rounded-2xl border border-hairline bg-card px-6 py-5">
                <h2 className="text-[17px] font-semibold text-foreground">Usage this cycle</h2>
                <div className="mt-5 space-y-5">
                  <UsageRow
                    label="Paths in progress"
                    value={String(hydrated ? Math.max(activePaths, 1) : 4)}
                    pct={hydrated ? Math.min(activePaths * 25, 100) : 62}
                  />
                  <UsageRow
                    label="Visualizer runs"
                    value={String(hydrated ? totalSteps : 320)}
                    pct={hydrated ? Math.min((totalSteps / 500) * 100, 100) : 78}
                  />
                </div>
                <div className="mt-8 border-t border-hairline pt-5">
                  <div className="font-mono text-[12.5px] text-muted-foreground">Next invoice:</div>
                  <div className="mt-2 font-mono text-[26px] font-medium leading-none text-foreground">
                    {planInfo.price}
                  </div>
                  <div className="mt-2 font-mono text-[12.5px] text-muted-foreground">
                    {isPro ? "on Mar 3, 2026" : "—"}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
