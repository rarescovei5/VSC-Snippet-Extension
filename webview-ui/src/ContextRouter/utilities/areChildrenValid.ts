import React from 'react';
import Route from '../components/Route';
import Routes from '../components/Routes';

/**
 * Validates that all direct children are Route components
 *
 * @param children - React children to validate
 * @returns boolean indicating if all children are valid Route components
 */
export function areChildrenRoute(children: React.ReactNode): boolean {
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

/**
 * Validates that direct Children are represented by a single `Routes` component
 *
 * @param children - React children to validate
 * @returns boolean indicating if there is 1 child of type Routes
 */
export function isChildrenRoutes(children: React.ReactNode): boolean {
  if (!children) {
    return true;
  }

  const childArray = React.Children.toArray(children);

  // Allow empty children
  if (childArray.length === 0) {
    return true;
  }

  if (!React.isValidElement(children) || children.type !== Routes) {
    console.error(
      `⚠️  Invalid <BrowserRouter ... /> child:`,
      children,
      `\n<BrowserRouter ... /> should have as children only one <Routes ... />`
    );
    return false;
  }

  return true;
}
