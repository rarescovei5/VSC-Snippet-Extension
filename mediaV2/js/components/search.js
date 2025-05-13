import { apiService } from '../services/api.service.js';
import { stateService } from '../services/state.service.js';
import { snippetsComponent } from './snippets.js';

export const searchComponent = {
  searchBarEl: document.getElementById('snippets-searchInput'),
  languageSelectEl: document.getElementById('language-filter-container'),
  gridViewBtnEl: document.getElementById('grid-view-btn'),
  listViewBtnEl: document.getElementById('list-view-btn'),
  cosmetic: {
    bIsLMenuOpened: false,
    bKeepRequesting: true,
    debounceTimer: null,
    currentPage: 1,
  },
  init() {
    this._bindContextMethods();

    // View Modes
    this.gridViewBtnEl.addEventListener('click', (_) => {
      this.handleViewChange('grid');
    });
    this.listViewBtnEl.addEventListener('click', (_) => {
      this.handleViewChange('list');
    });

    // Language Selection
    this.languageSelectEl.querySelector('#language-filter-button').addEventListener('click', (_) => {
      this.handleLanguageMenuToggle();
    });
    this.languageSelectEl.querySelectorAll('.language-option').forEach((optionEl) => {
      optionEl.addEventListener('click', () => {
        const selectedValue = optionEl.getAttribute('data-value');
        const selectedLabel = optionEl.textContent;

        // Update selected language in state
        stateService.setSelectedLanguage(selectedValue);

        // Update button label
        this.languageSelectEl.querySelector('#selected-language').textContent = selectedLabel;

        // Update selected status
        this.languageSelectEl.querySelectorAll('.language-option').forEach((el) => el.removeAttribute('data-selected'));
        optionEl.setAttribute('data-selected', 'true');

        // Close dropdown
        this.handleLanguageMenuToggle();
      });
    });

    // Searchbar
    this.searchBarEl.addEventListener('input', this.handleSearchChange);

    // Query
    stateService.subscribe('searchQuery', this.filterSnippets);
    stateService.subscribe('selectedLanguage', this.filterSnippets);
  },
  _bindContextMethods() {
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.filterSnippets = this.filterSnippets.bind(this);
    this.createInfiniteScrollHandler = this.createInfiniteScrollHandler.bind(this);
  },

  // Filters
  handleSearchChange(e) {
    if (this.cosmetic.debounceTimer) clearTimeout(this.cosmetic.debounceTimer);
    this.cosmetic.debounceTimer = setTimeout(() => {
      stateService.setSearchQuery(e.target.value);
    }, 250);
  },
  handleLanguageMenuToggle() {
    this.cosmetic.bIsLMenuOpened = !this.cosmetic.bIsLMenuOpened;
    this.languageSelectEl.querySelector('#language-dropdown').style.display = this.cosmetic.bIsLMenuOpened
      ? 'block'
      : 'none';
    this.languageSelectEl.querySelector('#language-filter-button > svg').style.transform = this.cosmetic.bIsLMenuOpened
      ? 'rotate(180deg)'
      : 'rotate(0deg)';
  },
  handleViewChange(newViewMode) {
    if (stateService.state.viewMode === newViewMode) return;

    this.gridViewBtnEl.classList.remove('active');
    this.listViewBtnEl.classList.remove('active');

    switch (newViewMode) {
      case 'grid':
        this.gridViewBtnEl.classList.add('active');
        break;
      case 'list':
        this.listViewBtnEl.classList.add('active');
    }

    stateService.setViewMode(newViewMode);
  },

  // fetch current snippets based on filters
  async filterSnippets() {
    snippetsComponent._reset();
    if (stateService.state.currentPath === 'snippets') {
      apiService.getDiscoverSnippets().then((data) => {
        if (data.totalPages === data.currentPage) this.cosmetic.bKeepRequesting = false;
        stateService.setSnippets(data.records);
      });
    } else {
      if (!/^folder-\d+$/.test(stateService.state.currentPath)) return;
      stateService.setSnippets(stateService.filterSnippets(snippetsComponent.currentFolderSnippets));
    }
  },

  // Infinite Scroll Used in Snippets Component
  createInfiniteScrollHandler() {
    let isLoading = false;
    const searchComponentRef = this;

    return function handleInfiniteScroll() {
      if (stateService.state.currentPath !== 'snippets') return;

      if (isLoading || !searchComponentRef.cosmetic.bKeepRequesting) return;

      const scrolledToBottom =
        this.snippetsContainer.scrollTop + this.snippetsContainer.clientHeight >=
        this.snippetsContainer.scrollHeight - 10;

      if (scrolledToBottom) {
        isLoading = true;

        apiService
          .getDiscoverSnippets(searchComponentRef.cosmetic.currentPage)
          .then((data) => {
            if (data.totalPages === data.currentPage) {
              searchComponentRef.cosmetic.bKeepRequesting = false;
            }
            stateService.addSnippets(data.records);
          })
          .finally(() => {
            isLoading = false;
          });
      }
    };
  },
};
