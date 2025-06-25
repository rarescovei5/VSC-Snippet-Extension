import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { Provider } from 'react-redux';
import { store } from './app/store.ts';
import { initFolders } from './app/folders/foldersSlice.ts';
import { initSettings } from './app/settings/settingsSlice.ts';

export const vscodeApi = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : {};

window.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg.type === 'INIT_FOLDERS') {
    store.dispatch(initFolders(msg.folders));
  } else if ((msg.type = 'INIT_SETTINGS')) {
    store.dispatch(initSettings(msg.settings));
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
