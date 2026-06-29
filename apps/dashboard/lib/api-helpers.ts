import { NextResponse } from "next/server";
import { isPublicApiError, ValidationError } from "@/lib/api-errors";

export type UnsupportedResponse = { error: string; code: "UNSUPPORTED_IN_LIVE_MODE" };
export type ApiErrorResponse = { error: string };

export function apiResponse<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, init);
}

/**
 * Build a JSON error response. `errorId` is included when present so a client
 * can quote it in a bug report and an operator can grep the server logs for the
 * matching entry.
 */
export function apiError(
  message: string,
  status: number = 500,
  errorId?: string
): NextResponse<{ error: string; errorId?: string }> {
  return NextResponse.json(
    errorId ? { error: message, errorId } : { error: message },
    { status }
  );
}

/**
 * Generate a short correlation id for an internal error. Used to tie a generic
 * client-facing 500 back to the full detail captured in the server logs.
 */
function newErrorId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `err_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`
  );
}

/**
 * Returns a 501 response indicating that this endpoint is not available in live mode.
 * The client-side code checks for the `code` field to distinguish unsupported live
 * operations from transient errors, so it can show an appropriate UI instead of
 * silently falling back to mock data.
 */
export function apiUnsupported(
  message: string
): NextResponse<UnsupportedResponse> {
  return NextResponse.json(
    { error: message, code: "UNSUPPORTED_IN_LIVE_MODE" },
    { status: 501 }
  );
}

export async function handleApiError<T>(
  fn: () => Promise<T | NextResponse>
): Promise<NextResponse<T | { error: string; errorId?: string }>> {
  try {
    const data = await fn();
    if (data instanceof Response) {
      return data as NextResponse<T | { error: string; errorId?: string }>;
    }

    return apiResponse(data);
  } catch (err) {
    // Expected, client-safe errors (validation, permission, not-found) carry
    // their own status and an intentional message — surface them as-is.
    if (isPublicApiError(err)) {
      if (err instanceof ValidationError && err.fields) {
        return NextResponse.json(
          { error: err.message, errors: err.fields },
          { status: err.statusCode }
        ) as NextResponse<T | { error: string; errorId?: string }>;
      }
      return apiError(err.message, err.statusCode);
    }

    // Anything else is an unexpected internal failure. Log the full detail with
    // a correlation id, but never return the raw message to the client.
    const errorId = newErrorId();
    console.error(`API Error [${errorId}]:`, err);
    return apiError("An unexpected error occurred", 500, errorId);
  }
}
