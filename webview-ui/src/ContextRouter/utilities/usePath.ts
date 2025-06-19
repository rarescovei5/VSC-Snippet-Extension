import { useContext } from 'react';
import { PathContext } from './BrowserRouter';
import type { PathContextType } from './types';

/**
 * Hook to access the current path and navigation function
 * 
 * @returns The path context containing:
 *   - path: Current path string
 *   - setPath: Function to update the current path
 * 
 * @throws {Error} If used outside of a BrowserRouter
 * 
 * @example
 * const { path, setPath } = usePath();
 * 
 * // Navigate programmatically
 * const handleClick = () => {
 *   setPath('/new-path');
 * };
 */
const usePath = (): PathContextType => {
  const context = useContext(PathContext);
  
  if (!context) {
    throw new Error('usePath must be used within a BrowserRouter');
  }
  
  return context;
};

export default usePath;
