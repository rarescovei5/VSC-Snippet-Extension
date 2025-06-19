import { createSlice } from '@reduxjs/toolkit';
import type { Uuid } from '../../types/types';

type FolderState = Uuid[][];

const initialState: FolderState = JSON.parse(localStorage.getItem('code-snippets/folders') || '[]');

const folderSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {},
});

export const {} = folderSlice.actions;
export default folderSlice.reducer;
