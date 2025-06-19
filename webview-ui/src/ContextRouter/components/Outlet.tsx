import React from 'react';

import { useRouter } from '../utilities/useRouter';
import { RouteContext, type RouteProps } from './Route';
import { matchesPath } from '../utilities/matchesPath';

const Outlet = () => {
  const { path } = useRouter();
  const routeCtx = React.useContext(RouteContext);

  if (!routeCtx?.children) return null;

  console.log('Outlet Print: ', path);

  const matchingRoute = React.Children.toArray(routeCtx.children).filter(
    (child) => React.isValidElement<RouteProps>(child) && matchesPath(path, '/*' + child.props.path)
  );

  return matchingRoute[0] ?? null;
};

export default Outlet;
