import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Code2, Compass, Search, X, type LucideIcon } from "lucide-react";
import { getAlgorithms } from "@/content/algorithms";
import { getLessons } from "@/content/lessons";
import { getProblems } from "@/content/problems";
import { APP_NAV } from "@/content/nav";

interface CommandItem {
  id: string;
  category: "Navigation" | "Algorithms" | "Lessons" | "Problems";
  title: string;
  detail?: string;
  icon: LucideIcon;
  to: string;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  /* Build item index */
  const allItems = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = APP_NAV.map((n) => ({
      id: n.id,
      category: "Navigation",
      title: n.title,
      detail: n.detail,
      icon: n.icon,
      to: n.to,
    }));

    const algoItems: CommandItem[] = getAlgorithms().map((a) => ({
      id: `algo-${a.slug}`,
      category: "Algorithms",
      title: a.name,
      detail: `${a.category} · O(${a.timeAvg})`,
      icon: Compass,
      to: `/algorithms/${a.slug}`,
    }));

    const lessonItems: CommandItem[] = getLessons().map((l) => ({
      id: `lesson-${l.slug}`,
      category: "Lessons",
      title: l.title,
      detail: `${l.estMinutes} min · ${l.sections.length} sections`,
      icon: BookOpen,
      to: `/algorithms/${l.algorithmSlug}`,
    }));

    const problemItems: CommandItem[] = getProblems().map((p) => ({
      id: `prob-${p.slug}`,
      category: "Problems",
      title: p.title,
      detail: `${p.difficulty} · ${p.algorithmSlug}`,
      icon: Code2,
      to: `/practice/${p.slug}`,
    }));

    return [...navItems, ...algoItems, ...lessonItems, ...problemItems];
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 12);
    const q = query.toLowerCase();
    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.detail?.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q),
      )
      .slice(0, 16);
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const selectItem = useCallback(
    (item: CommandItem) => {
      onClose();
      setQuery("");
      navigate({ to: item.to });
    },
    [onClose, navigate],
  );

  /* Keyboard controls */
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        selectItem(filtered[selectedIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, filtered, selectedIndex, selectItem]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-ink/40 backdrop-blur-sm">
      <div className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-hairline bg-card shadow-2xl">
        {/* Input header */}
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3.5">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search algorithms..."
            className="flex-1 bg-transparent font-mono text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center font-mono text-[13px] text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => selectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "bg-primary-tint text-primary"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isSelected
                        ? "border-primary bg-card text-primary"
                        : "border-hairline bg-card text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-sans text-[14px] font-medium leading-tight">
                      {item.title}
                    </div>
                    {item.detail && (
                      <div className="mt-0.5 truncate font-mono text-[11.5px] text-muted-foreground">
                        {item.detail}
                      </div>
                    )}
                  </div>
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-hairline bg-paper px-4 py-2 font-mono text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-hairline bg-card px-1 py-0.5">↑</kbd>
              <kbd className="ml-1 rounded border border-hairline bg-card px-1 py-0.5">↓</kbd> to
              navigate
            </span>
            <span>
              <kbd className="rounded border border-hairline bg-card px-1.5 py-0.5">↵</kbd> to
              select
            </span>
          </div>
          <span>
            <kbd className="rounded border border-hairline bg-card px-1.5 py-0.5">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
