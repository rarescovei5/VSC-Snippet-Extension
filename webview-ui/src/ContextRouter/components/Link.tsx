import React from 'react';
import type { Path } from '../types';
import usePath from '../utilities/usePath';

export type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Path };

const Link = (props: LinkProps) => {
  const { onPathChange } = usePath();
  return (
    <a
      {...props}
      onClick={(e) => {
        e.preventDefault();
        onPathChange(props.to);
      }}
    />
  );
};

export default Link;
