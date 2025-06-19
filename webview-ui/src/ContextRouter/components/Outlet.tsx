import React from 'react';

import { useRouter } from '../utilities/useRouter';
import { RouteContext, type RouteProps } from './Route';
import { matchesPath } from '../utilities/matchesPath';

const Outlet = () => {
  const { path } = useRouter();
  const routeCtx = React.useContext(RouteContext);

  if (!routeCtx?.children) return null;

  const matchingRoute = React.Children.toArray(routeCtx.children).filter((child) => {
    if (!React.isValidElement<RouteProps>(child)) return false;
    return matchesPath(path, routeCtx.pattern + child.props.path);
  });

  return matchingRoute[0] ?? null;
};

export default Outlet;
