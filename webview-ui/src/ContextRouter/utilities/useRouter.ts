import { useContext } from 'react';
import { PathContext } from '../components/ContextRouter';

/// Uses PathContext and returns the result
export const useRouter = () => {
  const context = useContext(PathContext);

  if (!context) {
    throw new Error('usePath must be used within a BrowserRouter');
  }

  return context;
};
