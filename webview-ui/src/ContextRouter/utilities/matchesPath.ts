/**
 * Check if a given path matches a route pattern.
 *
 * Supports:
 * - Exact routes:       "/users" <=> "/users"
 * - Parameters:         "/users/123" <=> "/users/:id"
 * - Global wildcard:    "/any/thing" <=> "*"
 * - Suffix wildcard:    "/foo/bar/baz" <=> "/foo/bar/*"
 *
 * @param path - The actual path (e.g. "/users/123")
 * @param pattern - The route pattern (e.g. "/users/:id" or "/foo/*")
 * @returns true if they match
 */
export function matchesPath(path: string, pattern: string): boolean {
  // Global wildcard
  if (pattern === '*') return true;

  // Normalize into segments, ignoring leading/trailing slashes
  const segs = (s: string) => s.split('/').filter(Boolean);
  const pathSegs = segs(path);
  const patternSegs = segs(pattern);

  // Handle suffix wildcard (last segment is "*")
  const hasSuffixWildcard = patternSegs[patternSegs.length - 1] === '*';
  if (hasSuffixWildcard) {
    const base = patternSegs.slice(0, -1);
    // path must start with base
    return base.every((seg, i) => seg.startsWith(':') || pathSegs[i] === seg);
  }

  // Must have same number of segments otherwise
  if (pathSegs.length !== patternSegs.length) return false;

  // Per-segment match: either exact or a parameter
  for (let i = 0; i < patternSegs.length; i++) {
    const p = patternSegs[i];
    if (p.startsWith(':')) continue;
    if (p !== pathSegs[i]) return false;
  }

  return true;
}
