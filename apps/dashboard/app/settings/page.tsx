"use client";

/**
 * app/settings/page.tsx
 *
 * Workspace settings page.
 *
 * Visibility rules:
 *  - Page is accessible to ALL roles (settings:read).
 *  - When canEditSettings() is false:
 *      • A read-only info banner is displayed at the top.
 *      • All input / select fields are rendered with the `disabled` attribute.
 *      • The "Save Changes" button is hidden.
 *  - When canEditSettings() is true, the page is fully interactive.
 *
 * Note: handleSave calls PATCH /api/settings. The server-side route handler
 * is the authoritative enforcement point (see app/api/settings/route.ts) —
 * this client only reacts to a 403 response, it does not decide permissions.
 */

import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "@/lib/hooks/useSession";
import { canEditSettings } from "@/lib/permissions";
import { useOptimisticMutation } from "@/lib/hooks/useOptimisticMutation";
import { useState, useRef } from "react";

export default function SettingsPage() {
  const session = useSession();
  const canEdit = canEditSettings(session);
  const [workspaceName, setWorkspaceName] = useState("GuildPass DAO");
  const [timezone, setTimezone] = useState("UTC");
  const [displayName, setDisplayName] = useState(session.name);
  const [email, setEmail] = useState("admin@guildpass.xyz");

  const previousSettingsRef = useRef({ workspaceName, timezone, displayName, email });

  const saveMutation = useOptimisticMutation<{ message: string }, any>({
    mutationFn: async (data) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`Access denied: ${body.error ?? "settings:write permission required"}`);
      }

      if (!res.ok) {
        throw new Error("An unexpected error occurred. Please try again.");
      }

      return res.json();
    },
    onOptimisticUpdate: (data) => {
      previousSettingsRef.current = { workspaceName, timezone, displayName, email };
      // Note: In a real app, we'd update the state with `data` here.
      // For this mock, we assume the form state is already updated via controlled inputs.
    },
    onRollback: () => {
      setWorkspaceName(previousSettingsRef.current.workspaceName);
      setTimezone(previousSettingsRef.current.timezone);
      setDisplayName(previousSettingsRef.current.displayName);
      setEmail(previousSettingsRef.current.email);
    },
    onSuccess: () => {
      alert("Settings saved successfully.");
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({ workspaceName, timezone, displayName, email });
  }

  return (
    <DashboardLayout title="Settings" session={session}>

      {/* ── Read-only banner ─────────────────────────────────────────────── */}
      {!canEdit && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4"
        >
          <span className="text-amber-500 text-xl leading-none mt-0.5" aria-hidden>🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Read-only access</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You can view settings but cannot make changes. Contact an admin to
              update workspace configuration.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── General Settings ─────────────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="workspace-name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Workspace Name
                </label>
                <input
                  id="workspace-name"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  disabled={!canEdit || saveMutation.isPending}
                  className={`w-full border rounded-lg px-4 py-2 transition-colors ${canEdit
                      ? "border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    } ${saveMutation.isPending ? "opacity-50" : ""}`}
                />
              </div>
              <div>
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={!canEdit || saveMutation.isPending}
                  className={`w-full border rounded-lg px-4 py-2 transition-colors ${canEdit
                      ? "border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    } ${saveMutation.isPending ? "opacity-50" : ""}`}
                >
                  <option>UTC</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Profile ──────────────────────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="display-name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!canEdit || saveMutation.isPending}
                  className={`w-full border rounded-lg px-4 py-2 transition-colors ${canEdit
                      ? "border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    } ${saveMutation.isPending ? "opacity-50" : ""}`}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!canEdit || saveMutation.isPending}
                  className={`w-full border rounded-lg px-4 py-2 transition-colors ${canEdit
                      ? "border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    } ${saveMutation.isPending ? "opacity-50" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Save button — write roles only ───────────────────────────────── */}
        {canEdit && (
          <div className="mt-6 flex justify-end">
            <button
              id="btn-save-settings"
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saveMutation.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </DashboardLayout>
  );
}
