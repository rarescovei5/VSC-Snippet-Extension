import React from 'react';
import type { Path } from '../types';
import { useRouter } from '../utilities/useRouter';

export type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Path };

const Link = (props: LinkProps) => {
  const { onClick, ...otherProps } = props;
  const { navigate } = useRouter();
  return (
    <a
      {...otherProps}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        navigate(props.to);
      }}
    />
  );
};

export default Link;
