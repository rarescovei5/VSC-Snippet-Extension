import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LocalSnippet, Prettify, Uuid } from '../../types/types';

export type FolderSnippets = Array<{ kind: 'remote'; snippetId: Uuid } | Prettify<LocalSnippet>>;
interface Folder {
  name: string;
  items: FolderSnippets;
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
    deleteFolder(state, action: PayloadAction<{ folderIdx: number }>) {
      const { folderIdx } = action.payload;
      if (folderIdx > state.length - 1) return;

      state.splice(folderIdx, 1);
    },
    setFolderName(state, action: PayloadAction<{ folderIdx: number; newFolderName: string }>) {
      const { folderIdx, newFolderName } = action.payload;
      const folder = state[folderIdx];
      if (!folder) return;

      folder.name = newFolderName;
    },
    addSnippets(state, action: PayloadAction<{ folderIdx: number; snippets: FolderSnippets }>) {
      const { folderIdx, snippets } = action.payload;
      const folder = state[folderIdx];
      if (!folder) return;

      snippets.forEach((snippet) => {
        const exists = folder.items.some(
          (item) =>
            snippet.kind !== item.kind ||
            (snippet.kind === 'remote' && item.kind === 'remote' && item.snippetId === snippet.snippetId) ||
            (snippet.kind === 'local' && item.kind === 'local' && item.code === snippet.code)
        );
        if (!exists) {
          folder.items.push(snippet);
        }
      });
    },
    deleteSnippets(state, action: PayloadAction<{ folderIdx: number; snippetIdxs: number[] }>) {
      const { folderIdx, snippetIdxs } = action.payload;
      const folder = state[folderIdx];
      if (!folder) return;

      const toRemove = new Set(snippetIdxs);
      folder.items = folder.items.filter((_, idx) => !toRemove.has(idx));
    },
  },
});

export const { addFolder, deleteFolder, addSnippets, deleteSnippets, setFolderName } = foldersSlice.actions;
export default foldersSlice.reducer;
