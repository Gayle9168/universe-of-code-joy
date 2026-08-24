import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, Lock, Monitor, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar, AppWorkspaceBar } from "@/components/app-shell";
import { SettingsNav } from "@/components/settings-nav";
import useHydrated from "@/hooks/useHydrated";
import type { ProfileData } from "@/stores/prefsStore";
import { usePrefsStore } from "@/stores/prefsStore";

export const Route = createFileRoute("/settings/")({
  component: SettingsProfile,
  head: () => ({
    meta: [
      { title: "Account settings — profile & security — Algora" },
      {
        name: "description",
        content:
          "Update your Algora profile, username, email and bio, and manage password, two-factor authentication and active sessions.",
      },
      { property: "og:title", content: "Account settings — profile & security — Algora" },
      {
        property: "og:description",
        content: "Manage your Algora profile details, security and active devices in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[12px] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputBase =
  "flex h-11 w-full items-center rounded-xl border border-hairline bg-card px-3.5 font-mono text-[13.5px] text-foreground";

const editableInput =
  "flex h-11 w-full items-center rounded-xl border border-hairline bg-card px-3.5 font-mono text-[13.5px] text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary-tint";

function SettingsProfile() {
  const hydrated = useHydrated();
  const profile = usePrefsStore((s) => s.profile);
  const twoFactor = usePrefsStore((s) => s.profile.twoFactorEnabled);
  const updateProfile = usePrefsStore((s) => s.updateProfile);

  /* ---- draft state (local copy for dirty tracking) ---- */
  const [draft, setDraft] = useState<ProfileData>(() => ({ ...profile }));

  /* Sync draft when store changes (e.g. after hydration) */
  useEffect(() => {
    if (hydrated) setDraft({ ...profile });
  }, [hydrated, profile]);

  const isDirty = useMemo(() => {
    if (!hydrated) return false;
    return (
      draft.fullName !== profile.fullName ||
      draft.username !== profile.username ||
      draft.email !== profile.email ||
      draft.country !== profile.country ||
      draft.bio !== profile.bio
    );
  }, [hydrated, draft, profile]);

  const handleSave = useCallback(() => {
    updateProfile(draft);
    toast.success("Profile saved");
  }, [draft, updateProfile]);

  const handleCancel = useCallback(() => {
    setDraft({ ...profile });
  }, [profile]);

  const handleToggle2FA = useCallback(() => {
    updateProfile({ twoFactorEnabled: !twoFactor });
    toast.success(twoFactor ? "Two-factor disabled" : "Two-factor enabled");
  }, [twoFactor, updateProfile]);

  /* Display values — SSR-safe baseline, then real after hydration */
  const d = hydrated ? draft : { fullName: "—", username: "—", email: "—", country: "—", bio: "—" };
  const initials = hydrated
    ? profile.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "—";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar active="Settings" collapsible />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppWorkspaceBar crumbs={["Settings"]} search />

        <main className="flex min-h-0 flex-1 gap-5 overflow-hidden px-8 py-5">
          <SettingsNav active="Profile" />

          <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-hairline bg-card">
            <div className="min-h-0 flex-1 overflow-hidden px-7 pt-5">
              <h1 className="text-[24px] font-semibold leading-none tracking-tight text-foreground">
                Profile
              </h1>

              {/* Avatar row */}
              <div className="mt-3.5 flex items-center gap-5 border-b border-hairline pb-3.5">
                <span className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-primary-tint font-mono text-[19px] text-primary">
                  {initials}
                </span>
                <div>
                  <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-hairline bg-card px-4 font-sans text-[14px] text-foreground hover:bg-secondary">
                    <Upload className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                    Change photo
                  </button>
                  <p className="mt-2 font-mono text-[12px] text-muted-foreground">
                    PNG or JPG, up to 2MB
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="mt-4 grid grid-cols-2 gap-x-7 gap-y-3.5">
                <Field label="Full name">
                  <input
                    className={editableInput}
                    value={d.fullName}
                    onChange={(e) => setDraft((p) => ({ ...p, fullName: e.target.value }))}
                  />
                </Field>
                <Field label="Username">
                  <input
                    className={editableInput}
                    value={d.username}
                    onChange={(e) => setDraft((p) => ({ ...p, username: e.target.value }))}
                  />
                </Field>
                <Field label="Email">
                  <div
                    className={`${inputBase} justify-between border-primary ring-4 ring-primary-tint`}
                  >
                    {d.email}
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-tint px-2 py-1 font-mono text-[11.5px] text-primary">
                      <Check className="h-3 w-3" strokeWidth={2.8} /> Verified
                    </span>
                  </div>
                </Field>
                <Field label="Country">
                  <div className={`${inputBase} justify-between`}>
                    {d.country}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.9} />
                  </div>
                </Field>
                <div className="col-span-2">
                  <Field label="Bio">
                    <textarea
                      className="min-h-[44px] w-full resize-none rounded-xl border border-hairline bg-card px-3.5 py-2.5 font-mono text-[13.5px] leading-[1.6] text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary-tint"
                      value={d.bio}
                      onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                      rows={2}
                    />
                  </Field>
                </div>
              </div>

              {/* Security preview */}
              <h2 className="mt-3.5 text-[19px] font-semibold leading-none tracking-tight text-foreground">
                Security
              </h2>
              <div className="mt-2.5 overflow-hidden rounded-xl border border-hairline">
                <div className="flex min-h-[40px] shrink-0 items-center gap-3 border-b border-hairline px-4">
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-[14px] text-foreground">Password</span>
                  <span className="ml-8 font-mono text-[13px] tracking-[0.18em] text-muted-foreground">
                    ·········
                  </span>
                  <button className="ml-auto font-sans text-[14px] text-primary hover:underline">
                    Change
                  </button>
                </div>
                <div className="flex min-h-[40px] shrink-0 items-center gap-3 border-b border-hairline px-4">
                  <ShieldCheck
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.8}
                  />
                  <span className="text-[14px] text-foreground">Two-factor authentication</span>
                  <button
                    onClick={handleToggle2FA}
                    className={`ml-auto flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                      hydrated && twoFactor ? "bg-primary" : "bg-hairline"
                    }`}
                    aria-label={`Two-factor authentication ${hydrated && twoFactor ? "enabled" : "disabled"}`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-card transition-transform ${
                        hydrated && twoFactor ? "ml-auto" : ""
                      }`}
                    />
                  </button>
                </div>
                <div className="flex min-h-[40px] shrink-0 items-center gap-3 px-4">
                  <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-[14px] text-foreground">Active sessions</span>
                  <span className="ml-8 font-mono text-[13px] text-muted-foreground">
                    2 devices
                  </span>
                  <button className="ml-auto font-sans text-[14px] text-primary hover:underline">
                    Manage
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky footer — only visible when dirty */}
            <div
              className={`mt-4 flex h-[68px] shrink-0 items-center justify-between border-t border-hairline px-7 transition-opacity ${
                isDirty ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <span className="font-mono text-[13px] text-primary">Unsaved changes</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  className="h-11 rounded-xl border border-hairline bg-card px-6 font-sans text-[14px] text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="h-11 rounded-xl bg-primary px-6 font-sans text-[14px] font-medium text-primary-foreground hover:bg-primary-glow"
                >
                  Save changes
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
