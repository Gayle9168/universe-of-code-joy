import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus, GraduationCap, Play, Flag } from "lucide-react";
import { SiteNav, SiteFooter, AlgoraGlyph } from "@/components/site-chrome";
import { pricingCatalogClaim } from "@/content/marketing-claims";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Algora" },
      {
        name: "description",
        content:
          "Free to start. Built for students. Upgrade to Pro for the full Algora experience, or bring Algora to your campus.",
      },
      { property: "og:title", content: "Pricing — Algora" },
      {
        property: "og:description",
        content: "Learn the fundamentals for free. Upgrade when you're ready to go deeper.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-paper text-foreground">
      <SiteNav active="Pricing" />
      <main id="main-content">
        <Hero />
        <PricingCards />
        <CompareTable />
        <StudentBanner />
        <FaqSection />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 pt-20 pb-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary-tint px-3 py-1 font-mono text-[11px] tracking-wider text-primary">
        <span className="text-[10px]">◆</span> PRICING
      </div>
      <h1 className="mt-6 font-sans text-[64px] leading-[1.05] tracking-[-0.02em] text-foreground">
        Free to start. Built for students
        <span className="inline-block ml-1 h-3 w-3 translate-y-[-2px] bg-primary" />
      </h1>
      <p className="mx-auto mt-5 max-w-[640px] font-sans text-[16px] text-muted-foreground">
        Learn the fundamentals for free. Upgrade when you're ready to go deeper.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <div className="inline-flex items-center rounded-full border border-hairline bg-card p-1">
          <button className="rounded-full px-5 py-1.5 font-sans text-sm text-foreground/80">
            Monthly
          </button>
          <button className="rounded-full bg-primary px-5 py-1.5 font-sans text-sm text-primary-foreground">
            Annual
          </button>
        </div>
        <span className="rounded-full bg-primary-tint px-3 py-1 font-mono text-[11px] text-primary">
          Save 20%
        </span>
      </div>
    </section>
  );
}

function Tick() {
  return (
    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10">
      <Check className="size-3 text-primary" strokeWidth={3} />
    </span>
  );
}

function PriceCard({
  name,
  price,
  suffix,
  tagline,
  features,
  cta,
  ctaVariant = "ghost",
  popular = false,
}: {
  name: string;
  price: string;
  suffix?: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaVariant?: "ghost" | "solid";
  popular?: boolean;
}) {
  return (
    <div className="relative">
      {popular && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-md bg-primary px-3 py-1 font-mono text-[10px] tracking-wider text-primary-foreground">
          MOST POPULAR
        </div>
      )}
      <div
        className={`flex h-full flex-col rounded-2xl bg-card p-8 ${
          popular
            ? "border-2 border-primary shadow-[0_8px_30px_-12px_rgba(14,156,134,0.25)]"
            : "border border-hairline"
        }`}
      >
        <div className="font-sans text-[22px] text-foreground">{name}</div>
        <div className="mt-5 flex items-baseline gap-1">
          <span className="font-mono text-[42px] leading-none tracking-tight text-foreground">
            {price}
          </span>
          {suffix && <span className="font-sans text-sm text-muted-foreground">{suffix}</span>}
        </div>
        <div className="mt-3 font-sans text-sm text-muted-foreground">{tagline}</div>
        <div className="my-6 h-px bg-hairline" />
        <ul className="flex-1 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 font-sans text-[14px] text-foreground">
              <Tick />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <button
          className={`mt-8 rounded-xl py-3 font-sans text-sm font-medium transition-colors ${
            ctaVariant === "solid"
              ? "bg-primary text-primary-foreground hover:bg-primary-glow"
              : "border border-hairline bg-card text-foreground hover:bg-secondary"
          }`}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

function PricingCards() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 pb-8">
      <div className="grid grid-cols-3 gap-6 pt-4">
        <PriceCard
          name="Free"
          price="$0"
          tagline="For getting started"
          features={["Core lessons", "Basic visualizer", "Daily streaks", "Community access"]}
          cta="Start free"
        />
        <PriceCard
          name="Pro"
          price="$9"
          suffix="/month"
          tagline="For serious prep"
          features={[
            "Everything in Free",
            pricingCatalogClaim.rawText,
            "Step-through debugger",
            "Spaced-repetition review",
            "Leagues + XP boosts",
            "Priority support",
          ]}
          cta="Go Pro"
          ctaVariant="solid"
          popular
        />
        <PriceCard
          name="Campus"
          price="Custom"
          tagline="For universities & cohorts"
          features={[
            "Volume seats",
            "Admin dashboard",
            "Cohort analytics",
            "SSO",
            "Dedicated onboarding",
          ]}
          cta="Contact sales"
        />
      </div>
    </section>
  );
}

function Cell({ v }: { v: boolean }) {
  return (
    <div className="flex items-center justify-center">
      {v ? (
        <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      ) : (
        <span className="h-px w-4 bg-muted-foreground/50" />
      )}
    </div>
  );
}

function CompareTable() {
  const rows: [string, boolean, boolean, boolean][] = [
    ["Core lessons", true, true, true],
    ["All algorithms", false, true, true],
    ["Interactive visualizer", true, true, true],
    ["Step-through debugger", false, true, true],
    ["Spaced repetition", false, true, true],
    ["Mastery map", true, true, true],
    ["Leagues & leaderboards", false, true, true],
    ["XP boosts", false, true, true],
    ["Admin dashboard", false, false, true],
    ["SSO", false, false, true],
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-8 py-10">
      <div className="overflow-hidden rounded-2xl border border-hairline bg-card">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-hairline">
          <div className="px-6 py-4 font-sans text-[15px] text-foreground">Compare features</div>
          <div className="py-4 text-center font-sans text-sm text-muted-foreground">Free</div>
          <div className="bg-primary-tint/50 py-4 text-center font-sans text-sm text-foreground">
            Pro
          </div>
          <div className="py-4 text-center font-sans text-sm text-muted-foreground">Campus</div>
        </div>
        {rows.map(([label, f, p, c], i) => (
          <div
            key={label}
            className={`grid grid-cols-[2fr_1fr_1fr_1fr] items-center ${
              i < rows.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <div className="px-6 py-3.5 font-sans text-[14px] text-foreground">{label}</div>
            <div className="py-3.5">
              <Cell v={f} />
            </div>
            <div className="bg-primary-tint/50 py-3.5">
              <Cell v={p} />
            </div>
            <div className="py-3.5">
              <Cell v={c} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudentBanner() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 pb-10">
      <div className="flex items-center justify-between gap-6 rounded-2xl border border-hairline bg-primary-tint/60 px-6 py-5">
        <div className="flex items-center gap-5">
          <div className="relative grid size-14 place-items-center">
            <span className="absolute inset-0 rounded-full border border-dashed border-primary/40" />
            <GraduationCap className="size-6 text-primary" />
          </div>
          <div className="font-sans text-[18px] text-foreground">
            Students get 50% off Pro with a .edu email
          </div>
        </div>
        <button className="rounded-xl border border-hairline bg-card px-5 py-2.5 font-sans text-sm font-medium text-foreground hover:bg-secondary">
          Verify student status
        </button>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    "Is there a student discount?",
    "Can I cancel anytime?",
    "Do you offer refunds?",
    "How does team/campus billing work?",
    "How often is content updated?",
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-8 py-12">
      <h2 className="text-center font-sans text-[36px] tracking-[-0.02em] text-foreground">
        Frequently asked questions
      </h2>
      <div className="mx-auto mt-8 max-w-[900px] overflow-hidden rounded-2xl border border-hairline bg-card">
        {faqs.map((q, i) => (
          <div
            key={q}
            className={`flex items-center justify-between px-6 py-5 ${
              i < faqs.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <span className="font-sans text-[15px] text-foreground">{q}</span>
            <Plus className="size-5 text-primary" />
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 pb-16">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8 rounded-2xl border border-hairline bg-primary-tint/60 px-10 py-10">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-hairline bg-card p-3">
            <div className="mb-2 flex gap-1">
              <span className="size-1.5 rounded-full bg-hairline" />
              <span className="size-1.5 rounded-full bg-hairline" />
              <span className="size-1.5 rounded-full bg-hairline" />
            </div>
            <Play className="size-6 text-primary" fill="currentColor" />
          </div>
          <AlgoraGlyph size={28} />
        </div>
        <div className="text-center">
          <div className="font-sans text-[24px] text-foreground">
            Start free, upgrade when you're ready
          </div>
          <button className="mt-4 rounded-xl bg-primary px-6 py-3 font-sans text-sm font-medium text-primary-foreground hover:bg-primary-glow">
            Create free account
          </button>
          <div className="mt-3 font-mono text-[12px] text-muted-foreground">
            No credit card. Cancel anytime.
          </div>
        </div>
        <div className="relative grid size-24 place-items-center">
          <span className="absolute inset-0 rounded-full border border-dashed border-primary/40" />
          <Flag className="size-7 text-primary" />
        </div>
      </div>
    </section>
  );
}
