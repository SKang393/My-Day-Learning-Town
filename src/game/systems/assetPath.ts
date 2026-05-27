export function resolveAssetPath(path: string | undefined): string {
  if (!path) return "";
  if (!path.startsWith("/assets/")) return path;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const relativePath = `${normalizedBase}${path.slice(1)}`;

  if (typeof window === "undefined") return relativePath;
  return new URL(relativePath, window.location.href).href;
}
