import { combineReducers, configureStore, type Middleware } from '@reduxjs/toolkit';
import foldersReducer, { foldersActionTypes } from './folders/foldersSlice';
import settingsReducer, { settingsActionTypes } from './settings/settingsSlice';
import { vscodeApi } from '../main';

const rootReducer = combineReducers({
  folders: foldersReducer,
  settings: settingsReducer,
});

const persistMiddleware: Middleware<{}, RootState> = (storeAPI) => (next) => (action: any) => {
  const result = next(action);

  const shouldPersist = foldersActionTypes.has(action.type) || settingsActionTypes.has(action.type);

  const state = storeAPI.getState();
  if (shouldPersist && typeof (vscodeApi as any).postMessage === 'function') {
    (vscodeApi as any).postMessage({
      type: 'persistState',
      folders: state.folders,
      settings: state.settings,
    });
  } else {
    localStorage.setItem('code-snippets/folders', JSON.stringify(state.folders));
    localStorage.setItem('code-snippets/settings', JSON.stringify(state.settings));
  }

  return result;
};

export const store = configureStore({
  reducer: {
    folders: foldersReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistMiddleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;
