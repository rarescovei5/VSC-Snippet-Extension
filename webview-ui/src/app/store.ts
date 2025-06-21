import { configureStore } from '@reduxjs/toolkit';
import folderReducer from './folder/folderSlice';
import settingsReducer from './settings/settingsSlice';

export const store = configureStore({
  reducer: {
    folderReducer,
    settingsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
