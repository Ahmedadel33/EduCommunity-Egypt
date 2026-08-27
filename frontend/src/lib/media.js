const BACKEND_ORIGIN = "http://localhost:5000";

export function resolveMediaUrl(url) {
  return url?.startsWith("http") ? url : url ? `${BACKEND_ORIGIN}${url}` : "";
}