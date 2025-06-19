import { useContext } from 'react';
import { PathContext } from '../components/BrowserRouter';

/// Uses PathContext and returns the result
const usePath = () => {
  const context = useContext(PathContext);

  if (!context) {
    throw new Error('usePath must be used within a BrowserRouter');
  }

  return context;
};

export default usePath;
