export function resolveAssetPath(path: string | undefined): string {
  if (!path) return "";
  if (!path.startsWith("/assets/")) return path;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${path.slice(1)}`;
}
