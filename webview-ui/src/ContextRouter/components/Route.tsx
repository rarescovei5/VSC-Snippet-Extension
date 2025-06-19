import React from 'react';
import type { Path } from '../types';

export interface RouteProps {
  path: Path;
  children: React.ReactElement<RouteProps> | React.ReactElement<RouteProps>[];
}

const Route = (props: RouteProps) => {
  return <div></div>;
};

export default Route;
