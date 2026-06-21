"use client";

import DashboardLayout from "@/components/DashboardLayout";
import LastUpdated from "@/components/LastUpdated";
import { useActivityFeed } from "@/lib/hooks/useActivityFeed";
import { type ActivityEventType } from "@guildpass/integration-client";

const TYPE_ICON: Record<ActivityEventType, string> = {
  "member.joined": "👤",
  "member.left": "🚪",
  "member.roles_changed": "🔄",
  "pass.created": "🎫",
  "pass.updated": "⚙️",
  "pass.purchased": "💳",
  "pass.deleted": "🗑️",
  "guild.created": "🏰",
  "guild.updated": "🏰",
  "guild.deleted": "🏚️",
  "access.granted": "🔓",
  "access.revoked": "🔒",
  "verification.completed": "✅",
  "webhook.received": "📡",
};

const TYPE_COLOR: Record<ActivityEventType, string> = {
  "member.joined": "bg-green-100",
  "member.left": "bg-orange-100",
  "member.roles_changed": "bg-yellow-100",
  "pass.created": "bg-blue-100",
  "pass.updated": "bg-blue-100",
  "pass.purchased": "bg-purple-100",
  "pass.deleted": "bg-red-100",
  "guild.created": "bg-pink-100",
  "guild.updated": "bg-pink-100",
  "guild.deleted": "bg-red-100",
  "access.granted": "bg-green-100",
  "access.revoked": "bg-red-100",
  "verification.completed": "bg-emerald-100",
  "webhook.received": "bg-indigo-100",
};

export default function ActivityPage() {
  const { events, lastUpdated, loading } = useActivityFeed();

  return (
    <DashboardLayout title="Activity">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{events.length} event{events.length !== 1 ? "s" : ""}</p>
        <LastUpdated date={lastUpdated} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        {loading && events.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">Loading activity…</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {events.map((activity) => (
              <li key={activity.id} className="px-6 py-4 flex items-start gap-4 animate-[fadeIn_0.3s_ease-in]">
                <div className={`w-10 h-10 rounded-full ${TYPE_COLOR[activity.type as ActivityEventType] || "bg-slate-100"} flex items-center justify-center text-lg shrink-0`}>
                  {TYPE_ICON[activity.type as ActivityEventType] ?? "📋"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-800 truncate">{activity.description}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${activity.source === "webhook" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-700"}`}>
                        {activity.source}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    by {activity.actor.name || activity.actor.wallet || "System"}
                  </p>
                  {activity.entity && (
                    <p className="text-xs text-slate-400 mt-1">
                      {activity.entity.type}: {activity.entity.name || activity.entity.id}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
