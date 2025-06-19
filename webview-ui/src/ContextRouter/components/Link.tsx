import React from 'react';
import type { Path } from '../types';
import { useRouter } from '../utilities/useRouter';

export type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Path };

const Link = (props: LinkProps) => {
  const { navigate } = useRouter();
  return (
    <a
      {...props}
      onClick={(e) => {
        e.preventDefault();
        navigate(props.to);
      }}
    />
  );
};

export default Link;
