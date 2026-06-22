"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type ActivityEvent } from "@guildpass/integration-client";
import { fetchActivity, generateMockActivity } from "@/lib/mock-data";

const REFRESH_MS =
  Number(process.env.NEXT_PUBLIC_ACTIVITY_REFRESH_MS) || 15_000;

interface UseActivityFeedOptions {
  /** How many events to surface at most (default: unlimited). */
  limit?: number;
}

interface UseActivityFeedResult {
  events: ActivityEvent[];
  lastUpdated: Date | null;
  loading: boolean;
}

export function useActivityFeed({ limit }: UseActivityFeedOptions = {}): UseActivityFeedResult {
  const [events, setEvents]           = useState<ActivityEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading]         = useState(true);
  const seenIds                       = useRef(new Set<string>());

  const mergeEvents = useCallback((incoming: ActivityEvent[]) => {
    const fresh = incoming.filter((e) => !seenIds.current.has(e.id));
    if (fresh.length === 0) return;
    fresh.forEach((e) => seenIds.current.add(e.id));
    setEvents((prev) => {
      const merged = [...fresh, ...prev].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return limit ? merged.slice(0, limit) : merged;
    });
    setLastUpdated(new Date());
  }, [limit]);

  /** Single poll tick: fetch real/mock data + inject one simulated event in mock mode. */
  const poll = useCallback(async () => {
    try {
      const data = await fetchActivity();
      mergeEvents(data);
      // Simulate a new arriving event every tick in mock/dev mode
      const mock = generateMockActivity();
      // Convert old-style mock to new format for the hook
      const convertedMock: ActivityEvent = {
        id: mock.id,
        type: "member.joined",
        source: "dashboard",
        severity: "info",
        actor: {
          name: mock.actor,
        },
        timestamp: mock.timestamp,
        description: mock.description,
      };
      mergeEvents([convertedMock]);
    } catch {
      // Silently swallow fetch errors; the feed keeps its last known state
    } finally {
      setLoading(false);
    }
  }, [mergeEvents]);

  useEffect(() => {
    // Initial load
    poll();

    const tick = () => {
      // Pause polling while the tab is hidden to avoid wasted requests
      if (document.visibilityState === "visible") poll();
    };

    const id = setInterval(tick, REFRESH_MS);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [poll]);

  return { events, lastUpdated, loading };
}
