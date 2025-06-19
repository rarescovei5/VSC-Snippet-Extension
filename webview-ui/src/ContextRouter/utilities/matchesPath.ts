/**
 * Matches a URL path against a route path pattern
 * 
 * @param currentPath - The current URL path (e.g., '/users/123')
 * @param routePath - The route path pattern (e.g., '/users/:id')
 * @returns boolean indicating if the paths match
 * 
 * @example
 * // Exact match
 * matchesPath('/users', '/users'); // true
 * 
 * // Parameter match
 * matchesPath('/users/123', '/users/:id'); // true
 * 
 * // Wildcard match
 * matchesPath('/any/path', '*'); // true
 */
export function matchesPath(currentPath: string, routePath: string): boolean {
  // Handle wildcard route
  if (routePath === '*') {
    return true;
  }

  // Handle exact match
  if (currentPath === routePath) {
    return true;
  }

  // Normalize paths by removing leading/trailing slashes
  const normalize = (path: string) => 
    path.split('/').filter(Boolean);

  const currentSegments = normalize(currentPath);
  const routeSegments = normalize(routePath);

  // Different number of segments can't match
  if (currentSegments.length !== routeSegments.length) {
    return false;
  }

  // Check each segment
  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];
    const currentSegment = currentSegments[i];

    // Parameter segment (starts with ':')
    if (routeSegment.startsWith(':')) {
      continue; // Any value is acceptable
    }

    
    // Exact segment match required
    if (routeSegment !== currentSegment) {
      return false;
    }
  }


  return true;
}
