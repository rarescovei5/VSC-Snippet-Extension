import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Prettify, Snippet, Uuid } from '../../types/types';

interface Folder {
  name: string;
  items: Array<
    { kind: 'remote'; snippetId: Uuid } | Prettify<{ kind: 'local' } & Omit<Snippet, 'id' | 'tags' | 'stars'>>
  >;
}

type FolderState = Folder[];

const initialState: FolderState = JSON.parse(localStorage.getItem('code-snippets/folders') || '[]');

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    addFolder(state, action: PayloadAction<{ name: string }>) {
      const { name } = action.payload;
      state.push({ name, items: [] });
    },
  },
});

export const { addFolder } = foldersSlice.actions;
export default foldersSlice.reducer;
