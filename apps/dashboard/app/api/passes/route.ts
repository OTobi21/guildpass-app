import { NextResponse } from "next/server";
import {
  apiError,
  apiUnsupported,
  apiValidationError,
  handleApiError,
} from "@/lib/api-helpers";
import { NotFoundError } from "@/lib/api-errors";
import { mockPasses, type Pass } from "@/lib/mock-data";
import { requireDashboardSession, UnauthorizedError } from "@/lib/auth/server-session";
import { assertPermission, PermissionDeniedError } from "@/lib/permissions";
import { getApiMode } from "@/lib/env";
import { getPassRepository } from "@/lib/repositories/factory";
import {
  malformedPayloadError,
  validatePassCreatePayload,
  validatePassUpdatePayload,
} from "@/lib/validation/mutations";
import { recordDashboardActivity } from "@/lib/activity/dashboard";

export async function GET(): Promise<NextResponse> {
  return handleApiError(async () => {
    const apiMode = getApiMode();

    if (apiMode === "live") {
      return apiUnsupported(
        "passes.list",
        apiMode,
        "Pass listing in live mode is not implemented"
      );
    }

    try {
      const passRepository = getPassRepository();
      return await passRepository.getAll();
    } catch (error) {
      console.error("Error fetching passes:", error);
      return mockPasses as Pass[];
    }
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  let session;
  try {
    session = requireDashboardSession(request);
    assertPermission(session, "passes:write");
  } catch (err) {
    if (err instanceof PermissionDeniedError) {
      return apiError(err.message, 403);
    }
    if (err instanceof UnauthorizedError) {
      return apiError(err.message, 401);
    }
    throw err;
  }

  return handleApiError(async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiValidationError("Invalid pass payload", malformedPayloadError());
    }

    const validation = validatePassCreatePayload(body);
    if (!validation.valid) {
      return apiValidationError("Invalid pass payload", validation.errors);
    }

    const passRepository = getPassRepository();
    const created = await passRepository.create(validation.data);
    await recordDashboardActivity({
      type: "pass.created",
      entity: { type: "pass", id: created.id, name: created.name },
      actor: { id: session!.userId, name: session!.name },
    });
    return created;
  });
}

export async function PATCH(request: Request): Promise<NextResponse> {
  let session;
  try {
    session = requireDashboardSession(request);
    assertPermission(session, "passes:write");
  } catch (err) {
    if (err instanceof PermissionDeniedError) {
      return apiError(err.message, 403);
    }
    if (err instanceof UnauthorizedError) {
      return apiError(err.message, 401);
    }
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return apiValidationError("Missing pass ID", [
      { field: "id", message: "id query parameter is required" },
    ]);
  }

  return handleApiError(async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiValidationError("Invalid pass payload", malformedPayloadError());
    }

    const validation = validatePassUpdatePayload(body);
    if (!validation.valid) {
      return apiValidationError("Invalid pass payload", validation.errors);
    }

    const passRepository = getPassRepository();
    const updated = await passRepository.update(id, validation.data);
    if (!updated) throw new NotFoundError("Pass not found.");
    await recordDashboardActivity({
      type: "pass.updated",
      entity: { type: "pass", id: updated.id, name: updated.name },
      actor: { id: session!.userId, name: session!.name },
    });
    return updated;
  });
}

export async function DELETE(request: Request): Promise<NextResponse> {
  let session;
  try {
    session = requireDashboardSession(request);
    assertPermission(session, "passes:write");
  } catch (err) {
    if (err instanceof PermissionDeniedError) {
      return apiError(err.message, 403);
    }
    if (err instanceof UnauthorizedError) {
      return apiError(err.message, 401);
    }
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return apiValidationError("Missing pass ID", [
      { field: "id", message: "id query parameter is required" },
    ]);
  }

  return handleApiError(async () => {
    const passRepository = getPassRepository();
    const pass = await passRepository.getById(id);
    if (!pass) throw new NotFoundError("Pass not found.");
    const success = await passRepository.delete(id);
    if (!success) throw new NotFoundError("Pass not found.");
    await recordDashboardActivity({
      type: "pass.deleted",
      entity: { type: "pass", id: pass.id, name: pass.name },
      actor: { id: session!.userId, name: session!.name },
    });
    return { success: true };
  });
}
