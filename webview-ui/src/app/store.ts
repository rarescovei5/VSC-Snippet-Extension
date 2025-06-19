import { configureStore } from '@reduxjs/toolkit';
import folderReducer from './folder/folderSlice';

const store = configureStore({
  reducer: {
    folderReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
