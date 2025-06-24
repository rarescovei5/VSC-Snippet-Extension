import React from 'react';
import type { Uuid } from '../types/types';

interface SelectedContextType {
  selectedSnippetIds: Set<Uuid>;
  setSelectedSnippetIds: React.Dispatch<React.SetStateAction<Set<Uuid>>>;
}
const initialSelectionContext: SelectedContextType = {
  selectedSnippetIds: new Set(),
  setSelectedSnippetIds: () => {},
};
export const SelectionContext = React.createContext<SelectedContextType>(initialSelectionContext);

const SelectionProvider = (props: { children: React.ReactNode }) => {
  const [selectedSnippetIds, setSelectedSnippetIds] = React.useState<Set<Uuid>>(() => new Set());
  const value = React.useMemo(() => ({ selectedSnippetIds, setSelectedSnippetIds }), [selectedSnippetIds]);
  return <SelectionContext value={value}>{props.children}</SelectionContext>;
};

export default SelectionProvider;
