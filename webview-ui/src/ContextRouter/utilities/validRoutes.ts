import { isValidElement, Children } from 'react';
import type { ReactNode, ReactElement } from 'react';
import type { RouteProps } from './types';

/**
 * Validates that all direct children are Route components
 * 
 * @param children - React children to validate
 * @returns boolean indicating if all children are valid Route components
 * 
 * @example
 * // Returns true
 * validRoutes([
 *   <Route path="/" element={<Home />} />,
 *   <Route path="about" element={<About />} />
 * ]);
 * 
 * // Returns false and logs error
 * validRoutes([
 *   <div>Invalid</div>,
 *   <Route path="about" element={<About />} />
 * ]);
 */
export function validRoutes(children: ReactNode): boolean {
  if (!children) {
    return true;
  }

  const childArray = Children.toArray(children);
  
  // Allow empty children
  if (childArray.length === 0) {
    return true;
  }

  let isValid = true;

  for (const child of childArray) {
    if (!isValidElement<unknown>(child)) {
      console.error(
        'Invalid child in Routes. All children must be <Route> components.'
      );
      isValid = false;
      continue;
    }

    // Type guard for ReactElement with props
    const typedChild = child as ReactElement<{ children?: ReactNode }>;

    // Check for React.Fragment
    if (
      typedChild.type === 'fragment' || 
      (typeof typedChild.type === 'function' && 
       'name' in typedChild.type && 
       typedChild.type.name === 'Fragment')
    ) {
      if (typedChild.props.children) {
        if (!validRoutes(typedChild.props.children)) {
          isValid = false;
        }
      }
      continue;
    }

    // Check for Route component
    try {
      // Dynamic import to avoid circular dependency
      const { default: Route } = require('./Route');
      if (child.type !== Route) {
        throw new Error('Not a Route component');
      }
    } catch (error) {
      console.error(
        'Invalid child in Routes. All children must be <Route> components.'
      );
      isValid = false;
    }
  }

  return isValid;
}

// This export is needed for type inference in other files
export type { RouteProps };
