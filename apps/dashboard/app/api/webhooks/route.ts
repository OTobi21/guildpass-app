import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@guildpass/webhook-utils";
import { getEnv } from "@/lib/env";
import { activityStorage } from "@/lib/activity/storage";
import { ActivityEvent, WebhookPayload } from "@/lib/activity/types";
import { validateWebhookPayload } from "@/lib/activity/validation";
import { sanitiseWebhookData, getSanitisedDescription } from "@/lib/activity/sanitise";

export async function POST(req: NextRequest) {
  try {
    const { WEBHOOK_SECRET } = getEnv();

    if (!WEBHOOK_SECRET) {
      console.error("WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const signatureHeader = req.headers.get("x-guildpass-signature");
    if (!signatureHeader) {
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 401 }
      );
    }

    const rawBody = await req.text();

    const verification = verifySignature({
      signatureHeader,
      secret: WEBHOOK_SECRET,
      payload: rawBody,
    });

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "Invalid signature" },
        { status: 401 }
      );
    }

    const validation = validateWebhookPayload(rawBody);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const payload = validation.payload;

    // Map webhook event to dashboard activity
    const activity = mapWebhookToActivity(payload);

    if (activity) {
      const result = await activityStorage.recordActivityEvent(activity);
      if (result === "duplicate") {
        return NextResponse.json({ status: "ignored", reason: "duplicate" });
      }

      return NextResponse.json({ status: "success", id: activity.id });
    }

    return NextResponse.json({ status: "ignored", reason: "unsupported event type" });
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function mapWebhookToActivity(payload: WebhookPayload): ActivityEvent | null {
  const { type, data, id, created } = payload;
  const timestamp = new Date(created * 1000).toISOString();
  const entityId = typeof data.id === "string" ? data.id : id;
  const sanitised = sanitiseWebhookData(type, data);
  const description = getSanitisedDescription(type, data);

  switch (type) {
    case "membership.created":
      return {
        id,
        type: "member.joined",
        source: "webhook",
        severity: "info",
        actor: {
          name: typeof data.name === "string" ? data.name : undefined,
          wallet: typeof data.wallet === "string" ? data.wallet : undefined,
        },
        description,
        timestamp,
        entity: {
          type: "member",
          id: entityId,
          name: typeof data.name === "string" ? data.name : undefined,
        },
        metadata: sanitised,
      };
    case "membership.updated":
      return {
        id,
        type: "member.left",
        source: "webhook",
        severity: "info",
        actor: {
          name: typeof data.name === "string" ? data.name : undefined,
          wallet: typeof data.wallet === "string" ? data.wallet : undefined,
        },
        description,
        timestamp,
        entity: {
          type: "member",
          id: entityId,
          name: typeof data.name === "string" ? data.name : undefined,
        },
        metadata: sanitised,
      };
    case "pass.created":
      return {
        id,
        type: "pass.created",
        source: "webhook",
        severity: "info",
        actor: {
          name: "Admin",
        },
        description,
        timestamp,
        entity: {
          type: "pass",
          id: entityId,
          name: typeof data.name === "string" ? data.name : undefined,
        },
        metadata: sanitised,
      };
    case "pass.updated":
      return {
        id,
        type: "pass.updated",
        source: "webhook",
        severity: "info",
        actor: {
          name: "Admin",
        },
        description,
        timestamp,
        entity: {
          type: "pass",
          id: entityId,
          name: typeof data.name === "string" ? data.name : undefined,
        },
        metadata: sanitised,
      };
    case "guild.updated":
      return {
        id,
        type: "guild.updated",
        source: "webhook",
        severity: "info",
        actor: {
          name: "Admin",
        },
        description,
        timestamp,
        entity: {
          type: "guild",
          id: entityId,
          name: typeof data.name === "string" ? data.name : undefined,
        },
        metadata: sanitised,
      };
    case "verification.completed":
      return {
        id,
        type: "verification.completed",
        source: "webhook",
        severity: "info",
        actor: {
          wallet: typeof data.wallet === "string" ? data.wallet : undefined,
        },
        description,
        timestamp,
        entity: {
          type: "verification",
          id: data.wallet ?? id,
        },
        metadata: sanitised,
      };
    default:
      return null;
  }
}
