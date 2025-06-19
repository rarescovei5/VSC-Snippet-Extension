import React from 'react';
import type { Path } from '../types';
import type { RoutesProps } from './Routes';
import { isChildrenRoutes } from '../utilities/areChildrenValid';

interface PathContextType {
  path: Path;
  navigate: React.Dispatch<React.SetStateAction<Path>>;
}

export const PathContext = React.createContext<PathContextType | null>(null);

export interface ContextRouterProps {
  basePath?: Path;
  children?: React.ReactElement<RoutesProps>;
}

const ContextRouter = (props: ContextRouterProps) => {
  const [path, setPath] = React.useState(props.basePath ?? '/');
  const value = React.useMemo(() => ({ path, navigate: setPath }), [path]);

  if (!isChildrenRoutes(props.children)) return null;

  return <PathContext value={value}>{props.children}</PathContext>;
};

export default ContextRouter;
