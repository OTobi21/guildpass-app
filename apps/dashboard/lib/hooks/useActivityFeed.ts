"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type ActivityEvent } from "@guildpass/integration-client";
import { type Activity, fetchActivity, generateMockActivity } from "@/lib/mock-data";
import { getActivityRefreshConfig, type ActivityRefreshConfig } from "@/lib/env";

interface UseActivityFeedOptions {
  /** How many events to surface at most (default: unlimited). */
  limit?: number;
  /** Override the polling interval from env. Pass 0 to disable auto-polling. */
  refreshIntervalMs?: number;
}

interface UseActivityFeedResult {
  events: ActivityEvent[];
  lastUpdated: Date | null;
  loading: boolean;
  /** Manually trigger a refresh — fetches new events and merges them. */
  refresh: () => Promise<void>;
  /** Whether a manual refresh is currently in-flight. */
  refreshing: boolean;
}

const TYPE_MAP: Record<Activity["type"], ActivityEvent["type"]> = {
  member_joined: "member.joined",
  pass_created: "pass.created",
  pass_purchased: "pass.purchased",
  role_changed: "member.roles_changed",
  access_granted: "access.granted",
};

function isActivityEvent(activity: Activity | ActivityEvent): activity is ActivityEvent {
  return "source" in activity && "severity" in activity;
}

function toActivityEvent(activity: Activity | ActivityEvent): ActivityEvent {
  if (isActivityEvent(activity)) return activity;

function toActivityEvent(activity: Activity): ActivityEvent {
  return {
    id: activity.id,
    type: TYPE_MAP[activity.type],
    source: "dashboard",
    severity: "info",
    actor: {
      name: activity.actor,
    },
    timestamp: activity.timestamp,
    description: activity.description,
  };
}

export function useActivityFeed({
  limit,
  refreshIntervalMs,
}: UseActivityFeedOptions = {}): UseActivityFeedResult {
  const [events, setEvents]           = useState<ActivityEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const seenIds                       = useRef(new Set<string>());

  // Resolve config — prefer explicit option over env default
  const config: ActivityRefreshConfig = getActivityRefreshConfig();
  const pollInterval =
    refreshIntervalMs !== undefined ? refreshIntervalMs : config.intervalMs;

  /**
   * Merge incoming events into state, guarding against duplicate IDs.
   * Events are sorted newest-first and capped by `limit` or maxEvents.
   */
  const mergeEvents = useCallback(
    (incoming: ActivityEvent[]) => {
      if (incoming.length === 0) return;

      // Skip events we have already seen
      const fresh = incoming.filter((e) => !seenIds.current.has(e.id));
      if (fresh.length === 0) return;

      fresh.forEach((e) => seenIds.current.add(e.id));

      setEvents((prev) => {
        const merged = [...fresh, ...prev].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Cap the stored events to avoid unbounded memory growth
        const max = limit ?? config.maxEvents;
        return max > 0 ? merged.slice(0, max) : merged;
      });
      setLastUpdated(new Date());
    },
    [limit, config.maxEvents],
  );

  /** Single poll tick: fetch real/mock data + inject one simulated event in mock mode. */
  const poll = useCallback(async () => {
    try {
      const data = await fetchActivity();
      mergeEvents(data.map(toActivityEvent));
      // Simulate a new arriving event every tick in mock/dev mode
      const mock = generateMockActivity();
      mergeEvents([toActivityEvent(mock)]);
    } catch {
      // Silently swallow fetch errors; the feed keeps its last known state
    } finally {
      setLoading(false);
    }
  }, [mergeEvents]);

  /**
   * Manual refresh handler — exposed to the UI so operators can force a poll
   * without waiting for the next interval tick.
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await poll();
    } finally {
      setRefreshing(false);
    }
  }, [poll]);

  useEffect(() => {
    // Initial load
    poll();

    // If polling is disabled (interval = 0), don't set up the timer
    if (pollInterval <= 0) return;

    const tick = () => {
      // Pause polling while the tab is hidden to avoid wasted requests
      if (document.visibilityState === "visible") poll();
    };

    const id = setInterval(tick, pollInterval);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [poll, pollInterval]);

  return { events, lastUpdated, loading, refresh, refreshing };
}
