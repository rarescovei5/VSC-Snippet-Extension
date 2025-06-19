import React from 'react';
import { RouteProps } from '../utilities/validRoutes';

interface RouteProps {
  path: string;
  children: React.ReactElement<RouteProps> | React.ReactElement<RouteProps>[];
}

const Route = () => {
  return <div></div>;
};

export default Route;
