import { stateService } from '../services/state.service.js';

export const contentComponent = {
  pages: {
    snippetsPageEl: document.getElementById('snippets-page'),
    settingsPageEl: document.getElementById('settings-page'),
  },
  init() {
    this._bindContextMethods();
    this.unsubscribe = stateService.subscribe('currentPath', this._handlePageChange);
  },
  _bindContextMethods() {
    this._handlePageChange = this._handlePageChange.bind(this);
  },
  _handlePageChange() {
    // Hide all Pages
    Object.values(this.pages).forEach((el) => el.classList.add('hidden'));

    // Remove Active Class from Buttons
    document.querySelectorAll('.sidebar-navigation button').forEach((el) => {
      el.classList.remove('active');
    });

    switch (stateService.state.currentPath) {
      case 'settings':
        this.pages.settingsPageEl.classList.remove('hidden');
        // Highlight settings BTN
        document.getElementById('settings-btn').classList.add('active');
        break;
      case 'snippets':
        this.pages.snippetsPageEl.classList.remove('hidden');
        // Highlight snippets BTN
        document.getElementById('snippets-btn').classList.add('active');
        break;
      // Presumably folder opened
      default:
        if (/^folder-\d+$/.test(stateService.state.currentPath)) {
          this.pages.snippetsPageEl.classList.remove('hidden');
          const folderID = parseInt(stateService.state.currentPath.split('-')[1]);

          // Highlight folder BTN
          const folderBtn = document.querySelector(`[data-folderid="${folderID}"]`);
          folderBtn.classList.add('active');
        } else {
          console.warn('Unknown path:', stateService.state.currentPath);
        }
        break;
    }
  },
};
