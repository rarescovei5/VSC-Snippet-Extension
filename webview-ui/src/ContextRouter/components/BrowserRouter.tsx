import React from 'react';
import type { Path } from '../types';

interface PathContextType {
  path: Path;
  onPathChange: React.Dispatch<React.SetStateAction<Path>>;
}

export const PathContext = React.createContext<PathContextType | null>(null);

export interface BrowserRouterProps {
  basePath?: Path;
}

const BrowserRouter = (props: BrowserRouterProps) => {
  const [path, setPath] = React.useState(props.basePath ?? '/');

  return <PathContext value={{ path, onPathChange: setPath }}></PathContext>;
};

export default BrowserRouter;
