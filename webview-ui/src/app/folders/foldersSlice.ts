import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LocalSnippet, Prettify, Uuid } from '../../types/types';

export type FolderSnippets = Array<{ kind: 'remote'; snippetId: Uuid } | Prettify<LocalSnippet>>;
export interface Folder {
  id: Uuid;
  name: string;
  items: FolderSnippets;
}
export type FolderState = Folder[];

const initialState: FolderState = JSON.parse(localStorage.getItem('code-snippets/folders') || '[]');

export const languageOptions = new Set([
  'c',
  'cpp',
  'csharp',
  'css',
  'go',
  'java',
  'javascript',
  'json',
  'kotlin',
  'lua',
  'php',
  'python',
  'ruby',
  'rust',
  'sql',
  'swift',
  'typescript',
  'xml',
]);

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    initFolders(_, action: PayloadAction<{ folders: Folder[] }>) {
      // This only gets called in VSC
      return action.payload.folders;
    },
    addFolder(state, action: PayloadAction<{ name: string }>) {
      const { name } = action.payload;
      state.push({ id: crypto.randomUUID(), name, items: [] });
    },
    importFolders(state, action: PayloadAction<{ folders: Folder[] }>) {
      const incoming = action.payload.folders;

      incoming.forEach((incomingFolder) => {
        const existingIdx = state.findIndex((f) => f.id === incomingFolder.id);
        if (existingIdx !== -1) {
          state[existingIdx] = incomingFolder;
        } else {
          state.push(incomingFolder);
        }
      });
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
          (item) => item.kind === 'remote' && snippet.kind === 'remote' && item.snippetId === snippet.snippetId
        );
        if (!exists) {
          folder.items.push(snippet);
        }
      });
    },
    setLocalSnippet(state, action: PayloadAction<{ folderIdx: number; snippetIdx: number; newSnippet: LocalSnippet }>) {
      const { folderIdx, snippetIdx, newSnippet } = action.payload;
      if (snippetIdx >= state[folderIdx].items.length || state[folderIdx].items[snippetIdx].kind !== 'local') return;
      state[folderIdx].items[snippetIdx] = newSnippet;
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

export const {
  initFolders,
  importFolders,
  addFolder,
  deleteFolder,
  addSnippets,
  deleteSnippets,
  setLocalSnippet,
  setFolderName,
} = foldersSlice.actions;
export default foldersSlice.reducer;
export const foldersActionTypes = new Set(
  Object.values(foldersSlice.actions)
    .filter((ac) => ac.type !== 'folders/initFolders')
    .map((ac) => ac.type)
);
