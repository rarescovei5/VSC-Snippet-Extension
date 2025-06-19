import React from 'react';
import type { Path } from '../types';
import { areChildrenRoute } from '../utilities/areChildrenValid';

interface RouteContextType {
  pattern: Path;
  children?: React.ReactElement<RouteProps> | React.ReactElement<RouteProps>[];
}

export const RouteContext = React.createContext<RouteContextType | null>(null);

export interface RouteProps {
  path: Path;
  children?: React.ReactElement<RouteProps> | React.ReactElement<RouteProps>[];
  element?: React.ReactNode;
}

const Route = (props: RouteProps) => {
  // Get parent Route
  const parentCtx = React.useContext(RouteContext);
  const parentPattern = parentCtx?.pattern ?? '';

  // strip off any trailing "/*" from the route’s own path
  const ownPathSansWildcard = props.path.replace(/\/\*$/, '');

  // compute the static base from the parent (also stripping its trailing wildcard)
  const basePattern = parentPattern === '*' ? '' : parentPattern.replace(/\/\*$/, '');

  // join them and collapse any "//" into a single "/"
  const fullPattern = `${basePattern}/${ownPathSansWildcard}`.replace(/\/\/+/g, '/');

  const value = React.useMemo(
    () => ({ children: props.children, pattern: fullPattern }),
    [props.children, fullPattern]
  );

  if (!areChildrenRoute(props.children)) return null;

  return <RouteContext value={value} children={props.element} />;
};

export default Route;
