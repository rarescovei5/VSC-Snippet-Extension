import React from 'react';
import type { Path } from '../types';
import { areChildrenRoute } from '../utilities/areChildrenValid';

interface RouteContextType {
  children?: React.ReactElement<RouteProps> | React.ReactElement<RouteProps>[];
}

export const RouteContext = React.createContext<RouteContextType | null>(null);

export interface RouteProps {
  path: Path;
  children?: React.ReactElement<RouteProps> | React.ReactElement<RouteProps>[];
  element?: React.ReactNode;
}

const Route = (props: RouteProps) => {
  const value = React.useMemo(() => ({ children: props.children }), [props.children]);

  if (!areChildrenRoute(props.children)) return null;

  return <RouteContext value={value} children={props.element} />;
};

export default Route;
