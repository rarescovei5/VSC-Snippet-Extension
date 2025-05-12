export const stateService = {
  state: {
    /**
     * These snippets are Displayed in snippets container
     */
    snippets: [],
    /**
     * Array<{folderName: string; snippetIds:[]}>
     */
    folders: JSON.parse(localStorage.getItem('folders')) || [],
    viewMode: 'grid', // or 'list' ()
    searchQuery: '',
    selectedLanguage: '',
  },

  // Snippets methods
  setSnippets(snippets) {
    this.state.snippets = snippets;
    this.notifyListeners('snippets');
  },
  addSnippets(snippets) {
    this.state.snippets.push(...snippets);
    this.notifyListeners('snippets');
  },

  // Folders methods
  setFolders(folders) {
    this.state.folders = folders;
    this.notifyListeners('folders');
  },
  addFolder(folder) {
    this.state.folders.push(folder);
    this.notifyListeners('folders');
  },
  removeFolder(deletedIdx) {
    this.state.folders = this.state.folders.filter((_, idx) => idx !== deletedIdx);
    this.notifyListeners('folders');
  },
  modifyFolder(folderIdx, option, newValue) {
    switch (option) {
      case 'folderName':
      case 'snippetIds':
        this.state.folders[folderIdx][option] = newValue;
        break;
      default:
        throw new Error(`Invalid 'option' for modifyFolder`);
    }
    this.notifyListeners('folders');
  },

  // Filter methods
  setSelectedLanguage(language) {
    this.state.selectedLanguage = language;
    this.notifyListeners('selectedLanguage');
  },

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.notifyListeners('searchQuery');
  },

  // ViewMode
  setViewMode(mode) {
    if (mode !== 'grid' && mode !== 'list') {
      console.warn(`Invalid view mode: ${mode}. Expected 'grid' or 'list'`);
      return;
    }
    this.state.viewMode = mode;
    this.notifyListeners('viewMode');
  },

  // Utility
  getFilteredSnippets() {
    const filtered = this.state.snippets.filter((snippet) => {
      const matchesTitle = snippet.title.toLowerCase().includes(this.state.searchQuery);
      const matchesLanguage = this.state.selectedLanguage ? snippet.language === this.state.selectedLanguage : true;
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
  notifyListeners(key) {
    if (this.listeners[key]) {
      this.listeners[key].forEach((callback) => callback(this.state[key]));
    }
  },
};
