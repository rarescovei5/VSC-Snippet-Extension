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
    addRemoteSnippets(state, action: PayloadAction<{ folderIdx: number; snippetIds: Uuid[] }>) {
      const { folderIdx, snippetIds } = action.payload;
      const folder = state[folderIdx];

      snippetIds.forEach((snippetId) => {
        const exists = folder.items.some((item) => item.kind === 'remote' && item.snippetId === snippetId);
        if (!exists) {
          folder.items.push({ kind: 'remote', snippetId });
        }
      });
    },

    removeSnippet(state, action: PayloadAction<{ folderIdx: number; idx: number }>) {
      const { folderIdx, idx } = action.payload;
      const folder = state[folderIdx];
      folder.items.splice(idx, 1);
    },
  },
});

export const { addFolder, addRemoteSnippets, removeSnippet } = foldersSlice.actions;
export default foldersSlice.reducer;
