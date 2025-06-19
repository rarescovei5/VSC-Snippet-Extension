import React from 'react';
import Route from '../components/Route';

/**
 * Validates that all direct children are Route components
 *
 * @param children - React children to validate
 * @returns boolean indicating if all children are valid Route components
 */
export function validRoutes(children: React.ReactNode): boolean {
  if (!children) {
    return true;
  }

  const childArray = React.Children.toArray(children);

  // Allow empty children
  if (childArray.length === 0) {
    return true;
  }

  let isValid = true;

  childArray.forEach((child) => {
    React;
    if (!React.isValidElement(child) || child.type !== Route) {
      console.error(
        `⚠️  Invalid <Route ... /> child:`,
        child,
        `\nAll children of <Route ... /> must also be <Route ... />`
      );
    }
  });

  return isValid;
}
