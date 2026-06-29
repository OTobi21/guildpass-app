import { NextResponse } from "next/server";

export type UnsupportedResponse = { error: string; code: "UNSUPPORTED_IN_LIVE_MODE" };
export type ApiErrorResponse = { error: string };

export function apiResponse<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, init);
}

export function apiError(
  message: string,
  status: number = 500
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status });
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
): Promise<NextResponse<T | { error: string }>> {
  try {
    const data = await fn();
    if (data instanceof Response) {
      return data as NextResponse<T | { error: string }>;
    }

    return apiResponse(data);
  } catch (err) {
    console.error("API Error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return apiError(message, 500);
  }
}
