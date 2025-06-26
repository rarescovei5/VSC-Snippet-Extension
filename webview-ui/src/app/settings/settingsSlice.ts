import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  apiConfig: {
    pageSize: number;
  };
  appearance: {
    showLineNumbers: boolean;
  };
}

const storedSettings = localStorage.getItem('code-snippets/settings');
const initialState: SettingsState = storedSettings
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
    initSettings(_, action: PayloadAction<{ settings: SettingsState }>) {
      // This only gets called in VSC
      return action.payload.settings;
    },
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

export const { initSettings, setPageSize, setShowLineNumbers } = settingsSlice.actions;
export default settingsSlice.reducer;
export const settingsActionTypes = new Set(Object.values(settingsSlice.actions).map((ac) => ac.type));
