/**
 * Check if a given path matches a route pattern.
 *
 * Supports:
 * - Exact routes:       "/users" <=> "/users"
 * - Parameters:         "/users/`123`" <=> "/users/`:id`"
 * - Wildcards:          "/`*`\/foo/bar/`*`" <=> "/`fizz/buzz`/foo/bar/`capucino/asasino`"
 *
 *
 * @param path - The actual path (e.g. "/users/123")
 * @param pattern - The route pattern (e.g. "/users/:id" or "/foo/*")
 * @throws When a parameter follows a wildcard (e.g. <code>/*\/:foo</code>)
 * @returns true if they match
 */
export function matchesPath(path: string, pattern: string): boolean {
  // Global wildcard matches anything
  if (pattern === '*') return true;

  // Split a string into non-empty segments
  const splitSegments = (input: string) => input.split('/').filter(Boolean);
  const pathSegments = splitSegments(path);
  const patternSegments = splitSegments(pattern);

  for (let i = 0; i < patternSegments.length - 1; i++) {
    if (patternSegments[i] === '*' && patternSegments[i + 1].startsWith(':')) {
      console.error(
        `Illegal route pattern "${pattern}": ` +
          `parameter segment "${patternSegments[i + 1]}" ` +
          `cannot immediately follow a wildcard. ` +
          `Please insert a literal segment between them.`
      );
      return false;
    }
  }

  // Pointers for walking the path and pattern
  let pathIndex = 0;
  let patternIndex = 0;

  // Remember positions for backtracking when we hit a '*'
  let lastStarPatternIndex = -1;
  let lastStarPathIndex = -1;

  /// "/*/foo/bar/*" <=> "/fizz/buzz/foo/bar/capucino/asasino"
  // Walk through the path segments
  while (pathIndex < pathSegments.length) {
    const currentPatternSegment = patternSegments[patternIndex];

    // Handle wildcard segment
    if (currentPatternSegment === '*') {
      // Record where the '*' was seen
      lastStarPatternIndex = patternIndex;
      lastStarPathIndex = pathIndex;
      // Move past '*' in the pattern
      patternIndex++;
      continue;
    }

    // Match parameter segment (e.g. ":id") or exact segment
    const currentPathSegment = pathSegments[pathIndex];
    const isParameter = currentPatternSegment?.startsWith(':');

    if (patternIndex < patternSegments.length && (isParameter || currentPatternSegment === currentPathSegment)) {
      // Advance both pointers on match
      patternIndex++;
      pathIndex++;
      continue;
    }

    // If mismatch and there was a previous '*', backtrack
    if (lastStarPatternIndex !== -1) {
      // Try to match one more segment with the last '*'
      patternIndex = lastStarPatternIndex + 1;
      pathIndex = ++lastStarPathIndex;
      continue;
    }

    // No wildcard to backtrack to, and segments don't match
    return false;
  }

  // Skip any trailing '*' in the pattern (e.g. /users/*/*/*/*)
  while (patternIndex < patternSegments.length && patternSegments[patternIndex] === '*') {
    patternIndex++;
  }

  // Only a match if we've consumed the entire pattern
  return patternIndex === patternSegments.length;
}
