import React from 'react';
import type { RouteProps } from './Route';

export interface RoutesProps {
  children: React.ReactElement<RouteProps> | React.ReactElement<RouteProps>[];
}

const Routes = (props: RoutesProps) => {
  return <div></div>;
};

export default Routes;
