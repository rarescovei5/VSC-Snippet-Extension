import React from 'react';
import type { RouteProps } from './Route';
import { areChildrenRoute } from '../utilities/areChildrenValid';
import { matchesPath } from '../utilities/matchesPath';
import { useRouter } from '../utilities/useRouter';

export interface RoutesProps {
  children?: React.ReactElement<RouteProps> | React.ReactElement<RouteProps>[];
}

const Routes = (props: RoutesProps) => {
  const { path } = useRouter();

  if (!areChildrenRoute(props.children)) return null;

  const matchingRoute = React.Children.toArray(props.children).filter(
    (child) => React.isValidElement<RouteProps>(child) && matchesPath(path, child.props.path)
  );

  if (matchingRoute.length > 1) {
    console.error(`Found more than 1 route mapped to following path: ${path}`);
    return null;
  }

  return matchingRoute[0] ?? null;
};

export default Routes;
