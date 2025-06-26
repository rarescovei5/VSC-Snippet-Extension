import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { Provider } from 'react-redux';
import { store } from './app/store.ts';
import { initFolders, type FolderState } from './app/folders/foldersSlice.ts';
import { initSettings, type SettingsState } from './app/settings/settingsSlice.ts';

export const vscodeApi = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : {};

window.addEventListener('message', (event) => {
  const msg = event.data as
    | {
        type: 'INIT_FOLDERS';
        folders: FolderState;
      }
    | {
        type: 'INIT_SETTINGS';
        settings: SettingsState;
      };

  console.log('MSG: ', msg);

  if (msg.type === 'INIT_FOLDERS') {
    store.dispatch(initFolders({ folders: msg.folders }));
  } else if ((msg.type = 'INIT_SETTINGS')) {
    store.dispatch(initSettings({ settings: msg.settings }));
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
