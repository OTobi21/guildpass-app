import { ActivityEvent, ActivityEventType } from "@guildpass/integration-client";
import { activityStorage } from "../activity/storage";

export interface ActivityStats {
  totalEvents: number;
  lastEventAt: string | null;
  eventsByType: Record<string, number>;
  eventsBySource: Record<string, number>;
}

/**
 * Activity service for managing audit events.
 *
 * Wraps the storage layer with a higher-level API that includes
 * incremental polling support (getEventsSince) and aggregated stats.
 */
class ActivityService {
  /**
   * Create a new activity event and store it
   */
  async createEvent(event: Omit<ActivityEvent, "id" | "timestamp">): Promise<ActivityEvent> {
    const fullEvent: ActivityEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    await activityStorage.addEvent(fullEvent);
    return fullEvent;
  }

  /**
   * Get all activity events, optionally filtered by type and capped by limit.
   */
  async getEvents(options?: { limit?: number; type?: ActivityEventType }): Promise<ActivityEvent[]> {
    let events = await activityStorage.getEvents() as ActivityEvent[];

    if (options?.type) {
      events = events.filter(e => e.type === options.type);
    }

    if (options?.limit) {
      events = events.slice(0, options.limit);
    }

    return events;
  }

  /**
   * Get only events that arrived after the given ISO timestamp.
   *
   * Used by the UI for incremental polling — the client passes the timestamp
   * of the most recent event it already knows about and receives only newer
   * events, avoiding re-fetching the entire feed on every tick.
   */
  async getEventsSince(since: string, options?: { limit?: number; type?: ActivityEventType }): Promise<ActivityEvent[]> {
    let events = await activityStorage.getEvents() as ActivityEvent[];

    // Filter events strictly newer than `since`
    events = events.filter(e => e.timestamp > since);

    if (options?.type) {
      events = events.filter(e => e.type === options.type);
    }

    if (options?.limit) {
      events = events.slice(0, options.limit);
    }

    return events;
  }

  /**
   * Check whether a given event ID has already been recorded (dedup guard).
   */
  async hasProcessedEvent(eventId: string): Promise<boolean> {
    return activityStorage.hasProcessedEvent(eventId);
  }

  /**
   * Return aggregate stats about stored activity events.
   */
  async getStats(): Promise<ActivityStats> {
    const events = await activityStorage.getEvents() as ActivityEvent[];
    const totalEvents = events.length;
    const lastEventAt = events.length > 0 ? events[0].timestamp : null;

    const eventsByType: Record<string, number> = {};
    const eventsBySource: Record<string, number> = {};

    for (const e of events) {
      eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
      eventsBySource[e.source] = (eventsBySource[e.source] || 0) + 1;
    }

    return { totalEvents, lastEventAt, eventsByType, eventsBySource };
  }

  /**
   * Helper to create a pass.created event
   */
  async createPassCreatedEvent(pass: { id: string; name: string }, actor: { name?: string; wallet?: string } = { name: "Admin" }): Promise<ActivityEvent> {
    return this.createEvent({
      type: "pass.created",
      source: "dashboard",
      severity: "info",
      actor,
      description: `Created new pass: ${pass.name}`,
      entity: { type: "pass", id: pass.id, name: pass.name },
    });
  }

  /**
   * Helper to create a member.joined event
   */
  async createMemberJoinedEvent(member: { id: string; name?: string; wallet?: string }, actor?: { name?: string; wallet?: string }): Promise<ActivityEvent> {
    const description = member.name
      ? `${member.name} joined the guild`
      : `New member joined: ${member.wallet}`;

    return this.createEvent({
      type: "member.joined",
      source: "dashboard",
      severity: "info",
      actor: actor || member,
      description,
      entity: { type: "member", id: member.id, name: member.name },
    });
  }

  /**
   * Helper to create a verification.completed event
   */
  async createVerificationCompletedEvent(wallet: string, actor: { name?: string; wallet?: string }): Promise<ActivityEvent> {
    return this.createEvent({
      type: "verification.completed",
      source: "dashboard",
      severity: "info",
      actor,
      description: `Verification completed for ${wallet}`,
      entity: { type: "verification", id: wallet },
      metadata: { wallet },
    });
  }
}

/**
 * Singleton instance of the activity service
 */
export const activityService = new ActivityService();
