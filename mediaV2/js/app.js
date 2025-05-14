import { contentComponent } from './components/content.js';
import { foldersComponent } from './components/folders.js';
import { searchComponent } from './components/search.js';
import { snippetsComponent } from './components/snippets.js';
import { redirectTo } from './utils/state.js';
import { apiService } from './services/api.service.js';
import { stateService } from './services/state.service.js';
import { settingsComponent } from './components/settings.js';

(function () {
  const addEventListeners = () => {
    const settingsBtn = document.getElementById('settings-btn');
    const snippetsBtn = document.getElementById('snippets-btn');

    settingsBtn.addEventListener('click', (_) => redirectTo('settings'));
    snippetsBtn.addEventListener('click', (_) => redirectTo('snippets'));
  };
  const initializeComponents = () => {
    contentComponent.init();
    foldersComponent.init();
    searchComponent.init();
    snippetsComponent.init();
    settingsComponent.init();
  };

  const initializeApp = () => {
    apiService.setupMessageListeners(stateService);
    addEventListeners();
    initializeComponents();
    redirectTo('snippets');
  };

  initializeApp();
})();
