/**
 * CSRF token helper for client components.
 *
 * The middleware sets a `csrf-token` cookie (non-httpOnly) using the
 * double-submit cookie pattern.  Client code must read this cookie and
 * include its value as the `X-CSRF-Token` header on state-changing requests.
 */

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "X-CSRF-Token";

/**
 * Read the CSRF token from the document cookie.
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`),
  );
  return match ? match[1] : null;
}

/**
 * Returns the CSRF header object to spread into fetch() headers.
 * If no token is found, returns an empty object (the request will likely
 * be rejected by the middleware with a 403).
 */
export function csrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { [CSRF_HEADER_NAME]: token } : {};
}

/**
 * Wrapper around fetch() that automatically includes the CSRF token header
 * on state-changing methods (POST, PUT, PATCH, DELETE).
 */
export async function fetchWithCsrf(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  // Only send JSON Content-Type by default if there's a body with no explicit content-type
  if (
    init.body &&
    !headers["Content-Type"] &&
    !headers["content-type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (isStateChanging) {
    Object.assign(headers, csrfHeaders());
  }

  return fetch(url, { ...init, headers });
}
