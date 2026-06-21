import { ActivityEvent } from "./types";
import { mockActivity } from "../mock-data";

/**
 * Interface for activity storage. 
 * Allows swapping in-memory with database later.
 */
export interface IActivityStorage {
  addEvent(event: ActivityEvent): Promise<void>;
  getEvents(limit?: number): Promise<ActivityEvent[]>;
  isDuplicate(eventId: string): Promise<boolean>;
}

/**
 * Convert old-style mock activities to new ActivityEvent format
 */
function convertMockActivityToEvent(activity: any): ActivityEvent {
  // Map old type strings to new ActivityEventType
  const typeMap: Record<string, any> = {
    member_joined: "member.joined",
    pass_created: "pass.created",
    pass_purchased: "pass.purchased",
    role_changed: "member.roles_changed",
    access_granted: "access.granted",
    membership_updated: "member.left",
    pass_updated: "pass.updated",
    guild_updated: "guild.updated",
    verification_completed: "verification.completed",
  };

  return {
    id: activity.id,
    type: typeMap[activity.type] || "webhook.received",
    source: "dashboard",
    severity: "info",
    actor: {
      name: activity.actor,
    },
    timestamp: activity.timestamp,
    description: activity.description,
    metadata: activity.metadata,
  };
}

/**
 * In-memory implementation of activity storage.
 * Note: This will reset on server restart.
 */
class InMemoryActivityStorage implements IActivityStorage {
  private events: ActivityEvent[] = [];
  private processedIds = new Set<string>();

  constructor() {
    // Seed with existing mock data converted to new format
    mockActivity.forEach((activity) => {
      this.events.unshift(convertMockActivityToEvent(activity));
      this.processedIds.add(activity.id);
    });
  }

  async addEvent(event: ActivityEvent): Promise<void> {
    if (this.processedIds.has(event.id)) {
      return;
    }
    
    this.events.unshift(event);
    this.processedIds.add(event.id);
    
    // Keep a reasonable limit in memory
    if (this.events.length > 1000) {
      const removed = this.events.pop();
      if (removed) this.processedIds.delete(removed.id);
    }
  }

  async getEvents(limit?: number): Promise<ActivityEvent[]> {
    return limit ? this.events.slice(0, limit) : [...this.events];
  }

  async isDuplicate(eventId: string): Promise<boolean> {
    return this.processedIds.has(eventId);
  }
}

// Global instance for the dashboard app
export const activityStorage = new InMemoryActivityStorage();
