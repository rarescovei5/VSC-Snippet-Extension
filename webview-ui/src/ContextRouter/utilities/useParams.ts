import React from 'react';
import { useRouter } from './useRouter';
import { RouteContext } from '../components/Route';

const splitSegments = (input: string) => input.split('/').filter((seg) => seg.length > 0);

// export type ParamKeys<S extends string> = S extends `${infer _Start}:${infer Param}/${infer Rest}`
//   ? Param | ParamKeys<`/${Rest}`>
//   : S extends `${infer _Start}:${infer Param}`
//   ? Param
//   : never;
//
// export function useParamsTyped<P extends string>(_: P): Record<ParamKeys<P>, string> {
//   return useParams();
// }

/**
 * @throws When a parameter follows a wildcard (e.g. <code>/*\/:foo</code>)
 * @returns An object whose keys are the path-parameter names and values are the matched segments.
 */
export function useParams(): Record<string, string> {
  const { path } = useRouter();
  const ctx = React.useContext(RouteContext);

  const pattern = ctx?.pattern;
  if (!pattern) return {};

  const patSegsForValidation = splitSegments(pattern);
  for (let i = 0; i < patSegsForValidation.length - 1; i++) {
    if (patSegsForValidation[i] === '*' && patSegsForValidation[i + 1].startsWith(':')) {
      console.error(
        `Illegal route pattern "${pattern}": ` +
          `parameter segment "${patSegsForValidation[i + 1]}" ` +
          `cannot immediately follow a wildcard. ` +
          `Please insert a literal segment between them.`
      );
      return {};
    }
  }

  return React.useMemo(() => {
    const params: Record<string, string> = {};
    const pathSegs = splitSegments(path);
    const patSegs = patSegsForValidation; // reuse

    let pathIdx = 0;
    let patIdx = 0;

    let lastStarPatIdx = -1;
    let lastStarPathIdx = -1;

    while (pathIdx < pathSegs.length) {
      const pat = patSegs[patIdx];

      // 1) wildcard → record for backtrack, skip it in pattern
      if (pat === '*') {
        lastStarPatIdx = patIdx++;
        lastStarPathIdx = pathIdx;
        continue;
      }

      const segment = pathSegs[pathIdx];

      // 2) parameter → capture it
      if (pat?.startsWith(':')) {
        const key = pat.slice(1);
        params[key] = segment;
        patIdx++;
        pathIdx++;
        continue;
      }

      // 3) exact match → consume both
      if (pat === segment) {
        patIdx++;
        pathIdx++;
        continue;
      }

      // 4) mismatch with previous '*'? → backtrack
      if (lastStarPatIdx !== -1) {
        patIdx = lastStarPatIdx + 1;
        pathIdx = ++lastStarPathIdx;
        continue;
      }

      // 5) no match at all
      return {};
    }

    // skip any trailing '*' in the pattern
    while (patIdx < patSegs.length && patSegs[patIdx] === '*') {
      patIdx++;
    }

    // if we didn’t consume the whole pattern, it’s not a match
    if (patIdx !== patSegs.length) {
      return {};
    }

    return params;
  }, [path, pattern]);
}
