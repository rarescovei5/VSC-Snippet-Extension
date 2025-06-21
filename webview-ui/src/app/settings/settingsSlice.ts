import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface settingsSliceType {
  apiConfig: {
    pageSize: number;
  };
  appearance: {
    showLineNumbers: boolean;
  };
}

const storedSettings = localStorage.getItem('code-snippets/settings');
const initialState: settingsSliceType = storedSettings
  ? JSON.parse(storedSettings)
  : {
      apiConfig: {
        pageSize: 10,
      },
      appearance: {
        showLineNumbers: false,
      },
    };

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setPageSize(state, action: PayloadAction<{ newPageSize: number }>) {
      const { newPageSize } = action.payload;
      if (newPageSize < 10) return;
      state.apiConfig.pageSize = newPageSize;
    },
    setShowLineNumbers(state, action: PayloadAction<{ newShowLineNumbers: boolean }>) {
      const { newShowLineNumbers } = action.payload;
      state.appearance.showLineNumbers = newShowLineNumbers;
    },
  },
});

export const { setPageSize, setShowLineNumbers } = settingsSlice.actions;
export default settingsSlice.reducer;
