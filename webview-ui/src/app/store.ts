import { configureStore } from '@reduxjs/toolkit';
import foldersReducer from './folders/foldersSlice';
import settingsReducer from './settings/settingsSlice';

export const store = configureStore({
  reducer: {
    folders: foldersReducer,
    settings: settingsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
