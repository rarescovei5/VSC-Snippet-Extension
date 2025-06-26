import React from 'react';
import type { Uuid } from '../types/types';

interface SelectedContextType {
  selected: Set<Uuid | number>;
  setSelected: React.Dispatch<React.SetStateAction<Set<Uuid | number>>>;
}
const initialSelectionContext: SelectedContextType = {
  selected: new Set(),
  setSelected: () => {},
};
export const SelectionContext = React.createContext<SelectedContextType>(initialSelectionContext);

const SelectionProvider = (props: { children: React.ReactNode }) => {
  const [selected, setSelected] = React.useState<Set<Uuid | number>>(() => new Set());
  const value = React.useMemo(() => ({ selected, setSelected }), [selected]);
  return <SelectionContext value={value}>{props.children}</SelectionContext>;
};

export default SelectionProvider;
