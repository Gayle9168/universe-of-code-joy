import { useCallback, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Clock,
  Flame,
  Pencil,
  Reply,
  Share2,
  ShieldCheck,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AppSidebar, AppWorkspaceBar } from "@/components/app-shell";
import useHydrated from "@/hooks/useHydrated";
import { usePrefsStore } from "@/stores/prefsStore";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
  head: () => ({
    meta: [
      { title: "Notifications — Algora" },
      {
        name: "description",
        content:
          "Your Algora activity inbox: badges earned, streak reminders, path updates and league changes — plus email and push preferences.",
      },
      { property: "og:title", content: "Notifications — Algora" },
      {
        property: "og:description",
        content: "Catch up on badges, streaks and league changes, and tune how you're notified.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type NotifItem = {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  section: "today" | "earlier";
  mention?: boolean;
};

const INITIAL_ITEMS: NotifItem[] = [
  {
    id: "n1",
    icon: ShieldCheck,
    title: "You earned the 'Graph Master' badge",
    detail: "Great job! You've mastered Graphs.",
    time: "2h",
    unread: true,
    section: "today",
  },
  {
    id: "n2",
    icon: Flame,
    title: "Keep your streak alive!",
    detail: "You're on a 23-day streak. Solve a problem today.",
    time: "4h",
    unread: true,
    section: "today",
  },
  {
    id: "n3",
    icon: Share2,
    title: "New lesson added to your path",
    detail: "Dijkstra's Algorithm is now available.",
    time: "6h",
    unread: true,
    section: "today",
  },
  {
    id: "n4",
    icon: Trophy,
    title: "You dropped to #9 in Teal League",
    detail: "Climb the ranks and earn more XP!",
    time: "Yesterday",
    unread: false,
    section: "earlier",
  },
  {
    id: "n5",
    icon: Reply,
    title: "Ananya replied to your solution",
    detail: "Check out Ananya's feedback on Two Sum.",
    time: "Yesterday",
    unread: false,
    section: "earlier",
    mention: true,
  },
  {
    id: "n6",
    icon: BarChart3,
    title: "Weekly recap is ready",
    detail: "You solved 18 problems and earned 1,340 XP.",
    time: "Jun 12",
    unread: false,
    section: "earlier",
  },
];

type FilterTab = "All" | "Unread" | "Mentions";

function Row({ item, onRead }: { item: NotifItem; onRead: (id: string) => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onRead(item.id)}
      className={`flex w-full items-center gap-3 border-b border-hairline px-5 py-3 text-left last:border-0 ${
        item.unread ? "bg-primary-tint/35" : "bg-card"
      }`}
    >
      <span className="flex w-2 shrink-0 justify-center">
        {item.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-hairline bg-primary-tint/70">
        <Icon className="h-[19px] w-[19px] text-primary" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-medium text-foreground">{item.title}</div>
        <p className="mt-0.5 truncate font-mono text-[12.5px] text-muted-foreground">
          {item.detail}
        </p>
      </div>
      <span className="shrink-0 font-mono text-[12.5px] text-muted-foreground">{item.time}</span>
    </button>
  );
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
        on ? "bg-primary" : "bg-hairline"
      }`}
      aria-label={label}
    >
      <span
        className={`h-5 w-5 rounded-full bg-card transition-transform ${on ? "ml-auto" : ""}`}
      />
    </button>
  );
}

const PREF_KEYS = [
  {
    key: "streakReminders" as const,
    icon: Flame,
    name: "Streak reminders",
    desc: "Daily nudges to keep your streak.",
  },
  {
    key: "achievements" as const,
    icon: ShieldCheck,
    name: "Achievements",
    desc: "Badges, milestones, and rewards.",
  },
  {
    key: "pathUpdates" as const,
    icon: Share2,
    name: "Path updates",
    desc: "New lessons and path changes.",
  },
  {
    key: "leaderboard" as const,
    icon: Trophy,
    name: "Leaderboard",
    desc: "Rank changes and league updates.",
  },
  {
    key: "weeklyRecap" as const,
    icon: BarChart3,
    name: "Weekly recap",
    desc: "Your weekly learning summary.",
  },
];

function Notifications() {
  const hydrated = useHydrated();
  const notifPrefs = usePrefsStore((s) => s.notificationPrefs);
  const setNotificationPref = usePrefsStore((s) => s.setNotificationPref);
  const quietStart = usePrefsStore((s) => s.quietHoursStart);
  const quietEnd = usePrefsStore((s) => s.quietHoursEnd);

  /* ---- notification items (local state — would be server-backed later) ---- */
  const [items, setItems] = useState<NotifItem[]>(INITIAL_ITEMS);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const unreadCount = useMemo(() => items.filter((i) => i.unread).length, [items]);

  const handleMarkAllRead = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
    toast.success("All notifications marked as read");
  }, []);

  const handleRead = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: false } : i)));
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "Unread") return items.filter((i) => i.unread);
    if (activeTab === "Mentions") return items.filter((i) => i.mention);
    return items;
  }, [items, activeTab]);

  const todayItems = useMemo(() => filtered.filter((i) => i.section === "today"), [filtered]);
  const earlierItems = useMemo(() => filtered.filter((i) => i.section === "earlier"), [filtered]);

  const handleSavePrefs = useCallback(() => {
    toast.success("Notification preferences saved");
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar active="Notifications" collapsible />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppWorkspaceBar crumbs={["Notifications"]} search />

        <main className="flex min-h-0 flex-1 gap-5 overflow-hidden px-8 py-5">
          {/* Inbox */}
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-hairline bg-card">
            <div className="flex shrink-0 items-center gap-3 px-5 pt-5">
              <h1 className="text-[24px] font-semibold leading-none tracking-tight text-foreground">
                Notifications
              </h1>
              <span className="rounded-md bg-primary-tint px-2.5 py-1 font-mono text-[12px] text-primary">
                {unreadCount} unread
              </span>
              <button
                onClick={handleMarkAllRead}
                className="ml-auto font-mono text-[13px] text-primary hover:underline"
              >
                Mark all read
              </button>
            </div>

            <div className="shrink-0 px-5 pt-4">
              <div className="inline-flex overflow-hidden rounded-xl border border-hairline">
                {(["All", "Unread", "Mentions"] as FilterTab[]).map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`h-10 px-7 font-mono text-[13px] transition-colors ${
                      i > 0 ? "border-l border-hairline" : ""
                    } ${
                      activeTab === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-hidden">
              {todayItems.length > 0 && (
                <>
                  <div className="border-b border-hairline px-5 py-2 font-mono text-[12px] text-muted-foreground">
                    Today
                  </div>
                  {todayItems.map((it) => (
                    <Row key={it.id} item={it} onRead={handleRead} />
                  ))}
                </>
              )}
              {earlierItems.length > 0 && (
                <>
                  <div className="border-b border-hairline bg-card px-5 py-2 font-mono text-[12px] text-muted-foreground">
                    Earlier
                  </div>
                  {earlierItems.map((it) => (
                    <Row key={it.id} item={it} onRead={handleRead} />
                  ))}
                </>
              )}
              {filtered.length === 0 && (
                <div className="py-10 text-center font-mono text-[13px] text-muted-foreground">
                  {activeTab === "Unread" ? "No unread notifications" : "No notifications"}
                </div>
              )}
              {filtered.length > 0 && (
                <div className="py-3 text-center font-mono text-[13px] text-muted-foreground">
                  That's all caught up!
                </div>
              )}
            </div>
          </section>

          {/* Preferences */}
          <aside className="flex w-[360px] shrink-0 flex-col rounded-2xl border border-hairline bg-card px-5 py-5">
            <h2 className="text-[22px] font-semibold leading-none tracking-tight text-foreground">
              Preferences
            </h2>
            <p className="mt-2 font-mono text-[12.5px] text-muted-foreground">
              How you're notified
            </p>

            <div className="mt-3 flex items-center justify-end gap-4 pr-1">
              <span className="w-11 text-center font-mono text-[12px] text-muted-foreground">
                Email
              </span>
              <span className="w-11 text-center font-mono text-[12px] text-muted-foreground">
                Push
              </span>
            </div>

            <div className="mt-2 overflow-hidden rounded-xl border border-hairline">
              {PREF_KEYS.map(({ key, icon: Icon, name, desc }) => {
                const pref = hydrated ? notifPrefs[key] : { email: true, push: true };
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 border-b border-hairline px-3.5 py-3 last:border-0"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={1.7} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium text-foreground">
                        {name}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[11.5px] text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Toggle
                        on={pref.email}
                        onToggle={() => setNotificationPref(key, "email", !pref.email)}
                        label={`${name} email notifications`}
                      />
                      <Toggle
                        on={pref.push}
                        onToggle={() => setNotificationPref(key, "push", !pref.push)}
                        label={`${name} push notifications`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3.5 flex items-center gap-3 rounded-xl border border-hairline px-3.5 py-3">
              <Clock className="h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={1.7} />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium text-foreground">Quiet hours</div>
                <p className="mt-0.5 truncate font-mono text-[11.5px] text-muted-foreground">
                  Pause notifications during this time.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-hairline bg-card px-2.5 py-1.5 font-mono text-[12px] text-foreground">
                {hydrated ? `${quietStart} – ${quietEnd}` : "22:00 – 08:00"}
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.8} />
              </span>
            </div>

            <button
              onClick={handleSavePrefs}
              className="mt-auto h-12 w-full rounded-xl bg-primary font-sans text-[14.5px] font-medium text-primary-foreground hover:bg-primary-glow"
            >
              Save preferences
            </button>
          </aside>
        </main>
      </div>
    </div>
  );
}
