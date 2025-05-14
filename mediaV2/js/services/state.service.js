export const stateService = {
  state: {
    // Folders (Local Data)
    folders: JSON.parse(localStorage.getItem('folders')) || [],

    // Content Displayed in snippets Container
    snippets: [],
    viewMode: 'grid', // or 'list' ()
    searchQuery: '',
    selectedLanguage: '',

    // Current route/path in the app
    currentPath: '',
  },

  // Route methods
  setCurrentPath(path) {
    this.state.currentPath = path;
    this._notifyListeners('currentPath');
  },

  // Snippets methods
  setSnippets(snippets) {
    this.state.snippets = snippets;
    this._notifyListeners('snippets');
  },
  addSnippets(snippets) {
    this.state.snippets.push(...snippets);
    this._notifyListeners('snippets');
  },

  // Folders methods
  setFolders(folders) {
    this.state.folders = folders;
    this._notifyListeners('folders');
  },
  addFolder(folder) {
    this.state.folders.push(folder);
    this._notifyListeners('folders');
  },
  removeFolder(deletedIdx) {
    this.state.folders = this.state.folders.filter((_, idx) => idx !== deletedIdx);
    this._notifyListeners('folders');
  },
  renameFolder(folderIdx, newName) {
    this.state.folders[folderIdx].folderName = newName;
    this._notifyListeners(`folders-${folderIdx}`);
  },
  modifyFolderSnippets(folderIdx, snippetIds) {
    this.state.folders[folderIdx].snippetIds = snippetIds;
    this._notifyListeners('folders');
  },
  removeSnippetFromFolder(folderIdx, snippetId) {
    const folder = this.state.folders[folderIdx];
    folder.snippetIds = folder.snippetIds.filter((id) => id !== snippetId);
    this._notifyListeners(`folders-snippets-remove`);
  },

  addSnippetToFolder(folderIdx, snippetId) {
    const folder = this.state.folders[folderIdx];
    if (!folder.snippetIds.includes(snippetId)) {
      folder.snippetIds.push(snippetId);
      this._notifyListeners('folders');
    }
  },

  // Filter methods
  setSelectedLanguage(language) {
    this.state.selectedLanguage = language;
    this._notifyListeners('selectedLanguage');
  },

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this._notifyListeners('searchQuery');
  },

  // ViewMode
  setViewMode(mode) {
    if (mode !== 'grid' && mode !== 'list') {
      console.warn(`Invalid view mode: ${mode}. Expected 'grid' or 'list'`);
      return;
    }
    this.state.viewMode = mode;
    this._notifyListeners('viewMode');
  },

  // Utility
  filterSnippets(snippets) {
    const filtered = snippets.filter((snippet) => {
      const matchesTitle = snippet.title.toLowerCase().includes(this.state.searchQuery);
      const matchesLanguage = this.state.selectedLanguage
        ? snippet.language.toLowerCase() === this.state.selectedLanguage.toLowerCase()
        : true;

      return matchesTitle && matchesLanguage;
    });
    return filtered;
  },

  // Observer pattern implementation
  listeners: {},
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    return () => this.unsubscribe(key, callback);
  },
  unsubscribe(key, callback) {
    if (this.listeners[key]) {
      this.listeners[key] = this.listeners[key].filter((cb) => cb !== callback);
    }
  },
  _notifyListeners(key) {
    if (this.listeners[key]) {
      this.listeners[key].forEach((callback) => callback(this.state[key]));
    }
  },
};
