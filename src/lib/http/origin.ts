export function requestOrigin(headers: { get(name: string): string | null }) {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const protocol =
    headers.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}
