import { createFileRoute } from "@tanstack/react-router";
import {
  Play,
  Pause,
  SkipForward,
  Check,
  Flame,
  Code2,
  SlidersHorizontal,
  CalendarCheck,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { AlgoraGlyph, SiteNav, SiteFooter } from "@/components/site-chrome";
import { heroProofStats, universitySocialProofClaim } from "@/content/marketing-claims";

export const Route = createFileRoute("/")({
  component: AlgoraLanding,
  head: () => ({
    meta: [
      { title: "Algora — See the algorithm think." },
      {
        name: "description",
        content:
          "Master data structures and interview prep through synchronized visualization, code, and plain-English explanation.",
      },
      { property: "og:title", content: "Algora — See the algorithm think." },
      {
        property: "og:description",
        content:
          "Gamified algorithm mastery through synchronized visualization, code, and plain-English explanation.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

/* --------------------------------- Nav ---------------------------------- */

/* --------------------------- Visualizer card ----------------------------- */
function TreeSvg() {
  // 1 root, children 2 & 3; 2's children: 4,5; 3's children: 6,7; 4's child: 8
  const nodes: Record<
    number,
    { x: number; y: number; state: "current" | "visited" | "unvisited" }
  > = {
    1: { x: 300, y: 40, state: "current" },
    2: { x: 180, y: 110, state: "visited" },
    3: { x: 420, y: 110, state: "unvisited" },
    4: { x: 110, y: 180, state: "visited" },
    5: { x: 250, y: 180, state: "unvisited" },
    6: { x: 360, y: 180, state: "unvisited" },
    7: { x: 490, y: 180, state: "unvisited" },
    8: { x: 60, y: 250, state: "unvisited" },
  };
  const edges: [number, number][] = [
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 5],
    [3, 6],
    [3, 7],
    [4, 8],
  ];
  const fill = (s: string) =>
    s === "current"
      ? "var(--primary)"
      : s === "visited"
        ? "var(--primary-tint-strong)"
        : "var(--card)";
  const stroke = (s: string) => (s === "unvisited" ? "var(--viz-edge)" : "var(--primary)");
  const textColor = (s: string) => (s === "current" ? "var(--card)" : "var(--ink)");
  return (
    <svg
      viewBox="0 0 560 290"
      className="w-full"
      role="img"
      aria-label="Interactive algorithm tree visualization"
    >
      {edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="var(--viz-edge)"
          strokeWidth="1.25"
        />
      ))}
      {Object.entries(nodes).map(([id, n]) => (
        <g key={id}>
          <circle
            cx={n.x}
            cy={n.y}
            r={20}
            fill={fill(n.state)}
            stroke={stroke(n.state)}
            strokeWidth="1.75"
          />
          <text
            x={n.x}
            y={n.y + 5}
            textAnchor="middle"
            fill={textColor(n.state)}
            fontSize="14"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="500"
          >
            {id}
          </text>
        </g>
      ))}
    </svg>
  );
}

function VisualizerCard() {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-5 shadow-[0_1px_2px_rgba(14,21,19,0.04),0_8px_28px_-12px_rgba(14,21,19,0.08)]">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="font-mono text-sm text-foreground">Step 4 / 11</div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <LegendDot color="var(--primary)" label="Current" />
          <LegendDot color="var(--primary-tint-strong)" label="Visited" />
          <LegendDot color="var(--card)" label="Unvisited" ring />
        </div>
      </div>

      {/* Two-panel body: left = editor, right = graph */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-4">
        {/* LEFT: Code editor */}
        <div className="overflow-hidden rounded-xl border border-hairline">
          <div className="flex items-center justify-between border-b border-hairline bg-paper px-3 py-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              bfs.py
            </span>
            <button className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              Python <ChevronDown size={12} />
            </button>
          </div>
          <div className="bg-card font-mono text-[12px] leading-[1.7]">
            {[
              {
                n: 1,
                t: (
                  <>
                    <Kw>from</Kw> collections <Kw>import</Kw> deque
                  </>
                ),
              },
              { n: 2, t: <>&nbsp;</> },
              {
                n: 3,
                t: (
                  <>
                    <Kw>def</Kw> <Fn>bfs</Fn>(root):
                  </>
                ),
              },
              {
                n: 4,
                t: (
                  <>
                    &nbsp;&nbsp;&nbsp;&nbsp;<Kw>if</Kw> <Kw>not</Kw> root: <Kw>return</Kw> []
                  </>
                ),
              },
              { n: 5, t: <>&nbsp;&nbsp;&nbsp;&nbsp;q, order = deque([root]), []</> },
              {
                n: 6,
                t: (
                  <>
                    &nbsp;&nbsp;&nbsp;&nbsp;<Kw>while</Kw> q:
                  </>
                ),
              },
              {
                n: 7,
                hl: true,
                t: <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;node = q.popleft()</>,
              },
              {
                n: 8,
                t: <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;order.append(node.val)</>,
              },
              {
                n: 9,
                t: (
                  <>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;q.extend([node.left,
                    node.right])
                  </>
                ),
              },
              {
                n: 10,
                t: (
                  <>
                    &nbsp;&nbsp;&nbsp;&nbsp;<Kw>return</Kw> order
                  </>
                ),
              },
            ].map((row) => (
              <div
                key={row.n}
                aria-current={row.hl ? "step" : undefined}
                className={`flex ${row.hl ? "bg-primary-tint" : ""}`}
              >
                <div className="w-9 shrink-0 select-none border-r border-hairline px-2 text-right text-muted-foreground/70">
                  {row.n}
                </div>
                <div className="px-3 text-foreground">{row.t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Tree + playback */}
        <div className="flex flex-col">
          <div className="flex-1 rounded-xl border border-hairline bg-paper p-3">
            <TreeSvg />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <IconBtn aria-label="Pause (Space)">
                <Pause size={13} strokeWidth={2} />
              </IconBtn>
              <IconBtn aria-label="Play (Space)">
                <Play size={13} strokeWidth={2} />
              </IconBtn>
              <IconBtn aria-label="Next step (→)">
                <SkipForward size={13} strokeWidth={2} />
              </IconBtn>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">Speed</span>
              <div className="relative flex-1">
                <div className="h-[3px] w-full rounded-full bg-secondary" />
                <div className="absolute left-0 top-0 h-[3px] w-[70%] rounded-full bg-primary" />
                <div className="absolute left-[calc(70%-6px)] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-primary bg-card" />
              </div>
              <span className="font-mono text-[11px] text-foreground">1.0x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation full width */}
      <div className="mt-4 rounded-xl border border-primary-tint-strong bg-primary-tint/50 p-4">
        <div className="mb-1 font-sans text-sm font-semibold text-primary">Explanation</div>
        <p className="font-sans text-[13.5px] leading-relaxed text-foreground/80">
          We dequeue the front node (1) from the queue and visit it. Then we enqueue its children
          (2, 3) to explore them next. This is Breadth-First Search (BFS).
        </p>
      </div>
    </div>
  );
}

function Kw({ children }: { children: React.ReactNode }) {
  return <span className="text-code-keyword">{children}</span>;
}
function Fn({ children }: { children: React.ReactNode }) {
  return <span className="text-code-fn">{children}</span>;
}
function LegendDot({ color, label, ring }: { color: string; label: string; ring?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono">{label}</span>
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: color,
          boxShadow: ring ? "inset 0 0 0 1px var(--viz-edge)" : undefined,
        }}
      />
    </div>
  );
}
function IconBtn({
  children,
  "aria-label": ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  "aria-label"?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-hairline bg-card text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      {children}
    </button>
  );
}

/* --------------------------------- Hero --------------------------------- */
function Hero() {
  return (
    <section className="mx-auto max-w-[1320px] px-8 pt-16 pb-20">
      <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] gap-12 items-start">
        {/* Left */}
        <div className="pt-2">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-tint-strong bg-primary-tint px-3 py-1.5 font-mono text-[11px] tracking-wide text-primary">
            <span className="text-primary">◆</span> ALGORITHM MASTERY, GAMIFIED
          </div>
          <h1 className="font-display text-[60px] font-semibold leading-[1.0] tracking-[-0.025em] text-foreground">
            See the
            <br />
            algorithm
            <br />
            think
            <span className="ml-1 inline-block h-3 w-3 bg-primary align-baseline" />
          </h1>
          <p className="mt-7 max-w-[380px] font-sans text-[16px] leading-relaxed text-muted-foreground">
            Master data structures and interview prep through synchronized visualization, code, and
            plain-English explanation.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button className="rounded-lg bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
              Start free — no card
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-hairline bg-card px-5 py-3 text-[14px] font-medium text-foreground hover:bg-secondary transition-colors">
              <Play size={14} fill="currentColor" /> Watch a traversal
            </button>
          </div>
          <div className="mt-8 flex items-center gap-x-4 font-mono text-[12px] text-muted-foreground">
            <span>{heroProofStats[0].rawText}</span>
            <span className="size-1 rounded-full bg-primary/70" />
            <span>{heroProofStats[1].rawText}</span>
            <span className="size-1 rounded-full bg-primary/70" />
            <span>{heroProofStats[2].rawText}</span>
          </div>
        </div>
        {/* Right */}
        <VisualizerCard />
      </div>
    </section>
  );
}

/* ------------------------------ Social proof ---------------------------- */
function SocialProof() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 py-10">
      <div className="mb-8 text-center font-sans text-sm text-muted-foreground">
        {universitySocialProofClaim.label}
      </div>
      <div className="flex items-center justify-center gap-16 text-muted-foreground/80">
        <MitLockup />
        <StanfordLockup />
        <BerkeleyLockup />
        <CmuLockup />
        <WaterlooLockup />
      </div>
    </section>
  );
}

function MitLockup() {
  return (
    <div className="flex items-center gap-2.5 h-10" aria-label="MIT">
      {/* Three-bar seal */}
      <svg viewBox="0 0 44 28" className="h-7" fill="currentColor" aria-hidden="true">
        <rect x="0" y="4" width="6" height="20" />
        <rect x="9" y="4" width="6" height="14" />
        <rect x="18" y="4" width="6" height="20" />
        <rect x="27" y="4" width="6" height="14" />
        <rect x="27" y="20" width="17" height="4" />
        <rect x="36" y="4" width="8" height="14" />
      </svg>
      <div className="leading-tight">
        <div className="font-serif text-[13px] font-semibold tracking-tight text-current">
          Massachusetts
        </div>
        <div className="font-serif text-[13px] font-semibold tracking-tight text-current">
          Institute of
        </div>
        <div className="font-serif text-[13px] font-semibold tracking-tight text-current">
          Technology
        </div>
      </div>
    </div>
  );
}

function StanfordLockup() {
  return (
    <div className="flex flex-col items-center leading-none" aria-label="Stanford University">
      <div className="font-serif text-[26px] font-semibold tracking-tight text-current">
        Stanford
      </div>
      <div className="font-serif text-[15px] mt-1 tracking-wide text-current">University</div>
    </div>
  );
}

function BerkeleyLockup() {
  return (
    <div className="flex flex-col items-center leading-none" aria-label="Berkeley">
      <div className="font-serif italic text-[30px] font-semibold tracking-tight text-current">
        Berkeley
      </div>
      <div className="font-sans text-[9px] mt-1.5 tracking-[0.2em] text-current">
        UNIVERSITY OF CALIFORNIA
      </div>
    </div>
  );
}

function CmuLockup() {
  return (
    <div className="flex items-center gap-2 h-10" aria-label="Carnegie Mellon University">
      {/* Simple shield */}
      <svg
        viewBox="0 0 24 32"
        className="h-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          d="M2 3 L22 3 L22 18 Q22 26 12 30 Q2 26 2 18 Z"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <line x1="12" y1="6" x2="12" y2="24" />
        <line x1="4" y1="14" x2="20" y2="14" />
      </svg>
      <div className="font-serif text-[13px] font-semibold leading-tight tracking-tight text-current">
        <div>Carnegie</div>
        <div>Mellon</div>
        <div>University</div>
      </div>
    </div>
  );
}

function WaterlooLockup() {
  return (
    <div className="flex items-center gap-2 h-10" aria-label="University of Waterloo">
      <svg
        viewBox="0 0 24 32"
        className="h-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M2 3 L22 3 L22 18 Q22 26 12 30 Q2 26 2 18 Z" />
        <path d="M7 10 L9 20 L12 12 L15 20 L17 10" />
      </svg>
      <div className="leading-tight font-sans">
        <div className="text-[9px] tracking-[0.22em] text-current">UNIVERSITY OF</div>
        <div className="text-[18px] font-bold tracking-[0.06em] text-current">WATERLOO</div>
      </div>
    </div>
  );
}

/* ------------------------------- Gamification --------------------------- */
function GamificationSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 py-20">
      <h2 className="mb-14 text-center font-display text-[44px] font-semibold tracking-[-0.02em] text-foreground">
        Progress you can feel
      </h2>
      <div className="grid grid-cols-4 gap-5">
        <GameCard title="Mastery Map" sub="Build skills. Unlock nodes." link="View all skills">
          <MasteryMap />
        </GameCard>
        <GameCard title="XP & Levels" sub="Every step earns XP." link="See rewards">
          <XpRing />
        </GameCard>
        <GameCard title="Streak" sub="Consistency compounds." link="View calendar">
          <StreakBlock />
        </GameCard>
        <GameCard title="Leagues" sub="Compete. Climb. Win." link="View leaderboard">
          <Leaderboard />
        </GameCard>
      </div>
    </section>
  );
}

function GameCard({
  title,
  sub,
  link,
  children,
}: {
  title: string;
  sub: string;
  link: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-hairline bg-card p-6">
      <div className="text-center">
        <div className="font-display text-lg font-semibold text-foreground">{title}</div>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <div className="flex-1 py-5">{children}</div>
      <a
        href="#"
        className="mt-auto flex items-center justify-center gap-1 font-mono text-[13px] text-primary hover:text-primary-glow"
      >
        {link} <ArrowRight size={12} />
      </a>
    </div>
  );
}

function MasteryMap() {
  const nodes = [
    { x: 100, y: 20, unlocked: true },
    { x: 55, y: 75, unlocked: true },
    { x: 145, y: 75, unlocked: true },
    { x: 175, y: 75, unlocked: false },
    { x: 30, y: 135, unlocked: false },
    { x: 80, y: 135, unlocked: false },
    { x: 130, y: 135, unlocked: false },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 4],
    [1, 5],
    [2, 6],
  ];
  return (
    <svg
      viewBox="0 0 200 170"
      className="mx-auto w-full max-w-[220px]"
      role="img"
      aria-label="Skill tree milestone map"
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="var(--viz-edge)"
          strokeWidth="1"
          strokeDasharray={!nodes[b].unlocked ? "3 3" : ""}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x}
            cy={n.y}
            r={14}
            fill={n.unlocked ? "var(--primary)" : "var(--secondary)"}
            stroke={n.unlocked ? "var(--primary)" : "var(--viz-edge)"}
            strokeWidth="1.25"
          />
          {n.unlocked ? (
            <path
              d={`M${n.x - 5},${n.y} L${n.x - 1},${n.y + 4} L${n.x + 5},${n.y - 3}`}
              stroke="var(--card)"
              strokeWidth="1.75"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <g
              transform={`translate(${n.x - 4}, ${n.y - 4})`}
              stroke="var(--slate-soft)"
              strokeWidth="1"
              fill="none"
            >
              <rect x="0" y="3" width="8" height="6" rx="1" fill="var(--slate-soft)" />
              <path d="M1.5 3 V1.5 A2.5 2.5 0 0 1 6.5 1.5 V3" />
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

function XpRing() {
  const pct = 2150 / 2400;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--viz-idle)" strokeWidth="8" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-2xl font-semibold text-foreground">Lvl 12</div>
          <div className="font-mono text-[10px] text-muted-foreground">2,150 / 2,400 XP</div>
        </div>
      </div>
      <div className="mt-2 rounded-full bg-primary-tint px-2.5 py-0.5 font-mono text-[11px] text-primary">
        +40 XP
      </div>
    </div>
  );
}

function StreakBlock() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex flex-col items-center">
      <Flame size={44} className="text-primary" strokeWidth={1.75} fill="var(--tint)" />
      <div className="mt-2 font-display text-xl font-semibold text-foreground">23-day streak</div>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="font-mono text-[10px] text-muted-foreground">{d}</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
              <Check size={9} className="text-primary-foreground" strokeWidth={3} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Leaderboard() {
  const rows = [
    { rank: 1, initial: "A", name: "Arjun", xp: "3,250" },
    { rank: 2, initial: "M", name: "Mei", xp: "3,120" },
    { rank: 3, initial: "J", name: "Jordan", xp: "2,980" },
  ];
  return (
    <div className="space-y-1.5 text-[12.5px]">
      {rows.map((r) => (
        <div key={r.rank} className="flex items-center gap-2 px-1.5 py-1">
          <span className="w-4 font-mono text-muted-foreground">{r.rank}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-tint font-mono text-[10px] text-primary">
            {r.initial}
          </span>
          <span className="flex-1 font-sans text-foreground">{r.name}</span>
          <span className="font-mono text-foreground">{r.xp} XP</span>
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-lg bg-primary-tint px-1.5 py-1.5">
        <span className="w-4 font-mono text-primary">12</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground">
          Y
        </span>
        <span className="flex-1 font-sans font-medium text-foreground">You</span>
        <span className="font-mono text-foreground">2,150 XP</span>
      </div>
    </div>
  );
}

/* ------------------------------- Features ------------------------------- */
function Features() {
  const feats = [
    {
      icon: <Code2 size={22} className="text-primary" strokeWidth={1.75} />,
      title: "Synced code + visuals",
      body: "See every line of code reflected in the visualization in real time.",
    },
    {
      icon: <SlidersHorizontal size={22} className="text-primary" strokeWidth={1.75} />,
      title: "Step-through debugger",
      body: "Control execution step-by-step and inspect state as you go.",
    },
    {
      icon: <CalendarCheck size={22} className="text-primary" strokeWidth={1.75} />,
      title: "Spaced-repetition review",
      body: "Reinforce what you learn with smart reviews that last.",
    },
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-8 py-14">
      <div className="grid grid-cols-3 divide-x divide-hairline">
        {feats.map((f, i) => (
          <div key={i} className="px-8 first:pl-0 last:pr-0">
            {f.icon}
            <div className="mt-4 font-display text-[17px] font-semibold text-foreground">
              {f.title}
            </div>
            <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            <a
              href="#"
              className="mt-4 inline-flex items-center gap-1 font-mono text-[13px] text-primary hover:text-primary-glow"
            >
              Learn more <ArrowRight size={12} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- CTA band ------------------------------- */
function CtaBand() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 py-10">
      <div className="relative flex items-center justify-between rounded-2xl border border-primary-tint-strong bg-primary-tint px-14 py-10">
        {/* left illustration */}
        <div className="rounded-lg border border-primary-tint-strong bg-card p-3">
          <div className="mb-1.5 flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-tint-strong" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary-tint-strong" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary-tint-strong" />
          </div>
          <div className="flex items-center gap-2">
            <Play size={20} className="text-primary" fill="var(--primary)" />
            <AlgoraGlyph size={28} />
          </div>
        </div>

        {/* Center */}
        <div className="flex flex-1 flex-col items-center">
          <h3 className="font-display text-[28px] font-semibold text-foreground">
            Start your first traversal today
          </h3>
          <button className="mt-5 rounded-lg bg-primary px-6 py-3 text-[15px] font-medium text-primary-foreground hover:bg-primary-glow transition-colors">
            Create free account
          </button>
          <p className="mt-3 font-mono text-[12px] text-muted-foreground">
            No credit card. Reduced-motion friendly.
          </p>
        </div>

        {/* Right flag */}
        <svg width="80" height="80" viewBox="0 0 80 80" className="text-primary" aria-hidden="true">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="3 4"
          />
          <line x1="40" y1="18" x2="40" y2="58" stroke="currentColor" strokeWidth="1.5" />
          <path d="M40 22 L58 28 L40 34 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}

/* -------------------------------- Page ---------------------------------- */
function AlgoraLanding() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteNav active="Learn" />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <GamificationSection />
        <Features />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
