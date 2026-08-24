import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ArrowRight,
  Shield,
  Clock,
  Headphones,
  Building2,
  Share2,
  BookOpen,
  FileText,
  Activity,
  Users,
  Plus,
  Minus,
  ChevronDown,
  Play,
  Flag,
} from "lucide-react";
import { SiteNav, SiteFooter, AlgoraGlyph } from "@/components/site-chrome";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Algora" },
      {
        name: "description",
        content:
          "Questions about learning, campus plans, partnerships, or your account? Reach the right team at Algora and expect a thoughtful response.",
      },
      { property: "og:title", content: "Contact — Algora" },
      {
        property: "og:description",
        content:
          "Reach the right team at Algora. Under 24h response, real human support, student-first.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-paper text-foreground">
      <SiteNav />
      <main id="main-content">
        <Hero />
        <PrimaryArea />
        <SelfServe />
        <FaqSection />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  const trust = ["Under 24h response", "Real human support", "Student-first"];
  return (
    <section className="mx-auto max-w-[1280px] px-8 pt-16 pb-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary-tint px-3 py-1 font-mono text-[11px] tracking-wider text-primary">
        <span className="text-[10px]">◆</span> CONTACT
      </div>
      <h1 className="mt-6 font-sans text-[64px] leading-[1.05] tracking-[-0.02em] text-foreground">
        Let's solve it together
        <span className="inline-block ml-1 h-3 w-3 translate-y-[-2px] bg-primary" />
      </h1>
      <p className="mx-auto mt-5 max-w-[640px] font-sans text-[16px] leading-[1.6] text-muted-foreground">
        Questions about learning, campus plans, partnerships, or your account? Reach the right team
        and expect a thoughtful response.
      </p>
      <div className="mt-7 flex items-center justify-center gap-8 font-sans text-[14px] text-foreground/80">
        {trust.map((t) => (
          <div key={t} className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-primary/10">
              <Check className="size-3 text-primary" strokeWidth={3} />
            </span>
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-2 font-mono text-[11px] tracking-wider text-muted-foreground">
      {children}
      {required && <span className="text-primary ml-1">*</span>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-hairline bg-card px-3.5 py-3 font-sans text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition";

function PrimaryArea() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 pb-16">
      <div className="grid grid-cols-[1.9fr_1fr] gap-6">
        {/* Form */}
        <div className="rounded-2xl border border-hairline bg-card p-8">
          <h2 className="font-sans text-[28px] tracking-[-0.01em] text-foreground">
            Send us a message
          </h2>
          <p className="mt-2 font-sans text-[14px] text-muted-foreground">
            Tell us what you need, and we'll route your message to the right person.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-5">
            <div>
              <Label required>FIRST NAME</Label>
              <input className={inputCls} placeholder="Jane" />
            </div>
            <div>
              <Label required>LAST NAME</Label>
              <input className={inputCls} placeholder="Doe" />
            </div>
          </div>

          <div className="mt-5">
            <Label required>EMAIL ADDRESS</Label>
            <input
              className={`${inputCls} border-primary ring-2 ring-primary/25`}
              placeholder="jane.doe@student.edu"
            />
          </div>

          <div className="mt-5">
            <Label required>WHAT CAN WE HELP WITH?</Label>
            <div className="relative">
              <select
                className={`${inputCls} appearance-none pr-10 text-muted-foreground/80`}
                defaultValue=""
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option>Product support</option>
                <option>Campus plans</option>
                <option>Partnerships</option>
                <option>Press</option>
                <option>Careers</option>
                <option>Something else</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>

          <div className="mt-5">
            <Label required>MESSAGE</Label>
            <div className="relative">
              <textarea
                rows={6}
                className={`${inputCls} resize-none`}
                placeholder="Tell us more about your question or request..."
              />
              <div className="absolute bottom-2 right-3 font-mono text-[11px] text-muted-foreground">
                0 / 1000
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2.5 font-sans text-[13px] text-muted-foreground">
            <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              Your privacy matters. We never share your information. <br />
              See our <a className="text-primary underline underline-offset-2">
                Privacy Policy
              </a>{" "}
              for details.
            </div>
          </div>

          <button className="mt-5 w-full rounded-xl bg-primary py-3.5 font-sans text-[15px] font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
            Send message
          </button>
          <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[11px] text-muted-foreground">
            <Clock className="size-3.5" />
            Typical response: within one business day.
          </div>
        </div>

        {/* Route cards */}
        <div className="flex flex-col gap-5">
          <RouteCard
            Icon={Headphones}
            title="Product support"
            body="Get help with lessons, progress, billing, or your account."
            email="support@algora.dev"
          />
          <RouteCard
            Icon={Building2}
            title="Campus & teams"
            body="Bring visual algorithm learning to your university or cohort."
            email="campus@algora.dev"
          />
          <RouteCard
            Icon={Share2}
            title="Partnerships"
            body="Collaborate on curriculum, communities, or student programs."
            email="partners@algora.dev"
          />
        </div>
      </div>
    </section>
  );
}

function RouteCard({
  Icon,
  title,
  body,
  email,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
  email: string;
}) {
  return (
    <a className="group rounded-2xl border border-hairline bg-card p-6 hover:border-primary/40 transition-colors">
      <Icon className="size-7 text-primary" strokeWidth={1.75} />
      <div className="mt-4 font-sans text-[20px] tracking-[-0.01em] text-foreground">{title}</div>
      <p className="mt-2 font-sans text-[14px] leading-[1.55] text-muted-foreground">{body}</p>
      <div className="mt-4 inline-flex items-center gap-1.5 font-sans text-[14px] text-primary">
        {email}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </a>
  );
}

function SelfServe() {
  const items = [
    { Icon: BookOpen, title: "Help center", body: "Guides for accounts, lessons, and progress." },
    {
      Icon: FileText,
      title: "Billing FAQ",
      body: "Plans, invoices, discounts, and cancellations.",
    },
    { Icon: Activity, title: "Platform status", body: "", status: true },
    { Icon: Users, title: "Student community", body: "Learn alongside other algorithm explorers." },
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-8 pb-16 text-center">
      <h2 className="font-sans text-[36px] tracking-[-0.02em] text-foreground">
        Find an answer faster
      </h2>
      <p className="mx-auto mt-3 max-w-[560px] font-sans text-[15px] text-muted-foreground">
        Explore the most common questions before sending a message.
      </p>
      <div className="mt-9 grid grid-cols-4 gap-5 text-left">
        {items.map((it) => (
          <div key={it.title} className="rounded-2xl border border-hairline bg-card p-6">
            <it.Icon className="size-6 text-primary" strokeWidth={1.75} />
            <div className="mt-4 font-sans text-[17px] tracking-[-0.01em] text-foreground">
              {it.title}
            </div>
            {it.status ? (
              <div className="mt-2 flex items-center gap-2 font-sans text-[13px] text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" />
                All systems operational.
              </div>
            ) : (
              <p className="mt-2 font-sans text-[13px] leading-[1.55] text-muted-foreground">
                {it.body}
              </p>
            )}
            <div className="mt-4 inline-flex items-center gap-1.5 font-sans text-[13px] text-primary">
              Explore <ArrowRight className="size-3.5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const rows = [
    { q: "Can I use Algora for free?" },
    { q: "Do you offer student discounts?" },
    { q: "Can universities request a demo?" },
    {
      q: "How quickly does support respond?",
      open: true,
      a: "Most messages receive a reply within one business day. Account and billing issues are prioritized.",
    },
    { q: "Where can I report a technical issue?" },
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-8 pb-16">
      <div className="rounded-2xl border border-hairline bg-card p-10">
        <div className="grid grid-cols-[1fr_1.8fr] gap-10">
          <div>
            <div className="font-mono text-[11px] tracking-wider text-primary">
              COMMON QUESTIONS
            </div>
            <h2 className="mt-3 font-sans text-[34px] leading-[1.1] tracking-[-0.02em] text-foreground">
              Before you hit send
              <span className="inline-block ml-1 h-2.5 w-2.5 translate-y-[-2px] bg-primary" />
            </h2>
            <p className="mt-4 font-sans text-[14px] leading-[1.6] text-muted-foreground">
              Quick answers to the most common questions from learners and teams.
            </p>
            <p className="mt-4 font-sans text-[14px] leading-[1.6] text-muted-foreground">
              If you still need help, we're here for you.
            </p>
          </div>
          <div>
            {rows.map((r, i) => (
              <div key={r.q} className={i === 0 ? "" : "border-t border-hairline"}>
                <button className="flex w-full items-center justify-between py-4 text-left font-sans text-[15px] text-foreground">
                  {r.q}
                  {r.open ? (
                    <Minus className="size-4 text-primary" />
                  ) : (
                    <Plus className="size-4 text-primary" />
                  )}
                </button>
                {r.open && r.a && (
                  <div className="rounded-lg bg-primary-tint/50 px-4 py-3 mb-4 font-sans text-[14px] leading-[1.6] text-muted-foreground">
                    {r.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 pb-16">
      <div className="rounded-2xl bg-primary-tint px-10 py-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8">
          {/* Browser icon */}
          <div className="w-[150px] rounded-lg border border-primary/30 bg-card p-3">
            <div className="flex gap-1">
              <span className="size-1.5 rounded-full bg-primary/40" />
              <span className="size-1.5 rounded-full bg-primary/40" />
              <span className="size-1.5 rounded-full bg-primary/40" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-md bg-primary-tint">
                <Play className="size-4 text-primary" fill="currentColor" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="h-1.5 rounded-full bg-primary/25" />
                <div className="h-1.5 w-2/3 rounded-full bg-primary/15" />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <AlgoraGlyph size={16} />
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-sans text-[30px] tracking-[-0.02em] text-foreground">
              Ready to learn instead?
            </h3>
            <p className="mt-2 font-sans text-[14px] text-muted-foreground">
              Start visualizing your first algorithm in minutes.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button className="rounded-full bg-primary px-5 py-2.5 font-sans text-sm font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
                Start learning free
              </button>
              <button className="rounded-full border border-primary/40 bg-card px-5 py-2.5 font-sans text-sm font-medium text-primary hover:bg-primary-tint transition-colors">
                Explore the visualizer
              </button>
            </div>
            <div className="mt-3 font-mono text-[11px] text-muted-foreground">
              No credit card required.
            </div>
          </div>

          {/* Flag illustration */}
          <div className="relative size-[120px]">
            <svg
              viewBox="0 0 120 120"
              className="size-full text-primary"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 4"
                opacity="0.6"
              />
              <path
                d="M40 90 Q 30 60, 60 55 T 82 30"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 4"
                fill="none"
                opacity="0.7"
              />
            </svg>
            <Flag className="absolute right-6 top-6 size-8 text-primary" strokeWidth={1.75} />
          </div>
        </div>
      </div>
    </section>
  );
}
