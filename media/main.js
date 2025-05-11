/** Add something to settings page
 * */

class SnippetApp {
  constructor(vscApi) {
    this.API_URL = 'http://localhost:3000/api/v1/snippets';

    this.vscApi = vscApi;
    this.activeViewType = 'grid';

    this.pageState = this.createPageStateProxy();

    this.bindContextMethods();

    this.folders = JSON.parse(localStorage.getItem('folders')) || {};

    this.currentSnippetsView = {
      currentPage: 1,
      snippets: [],
    };

    this.searchParams = {
      title: '',
      language: '',
    };
    this.debounceTimer = null;
    this.noMoreSnippets = false;
  }

  isInFolder() {
    return Boolean(this.pageState.activeButton?.dataset.folderid);
  }

  bindContextMethods() {
    this.handlePageNavigation = this.handlePageNavigation.bind(this);
    this.handleViewToggle = this.handleViewToggle.bind(this);
    this.createFolderButton = this.createFolderButton.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  createPageStateProxy() {
    const defaultButton = document.getElementById(DOM_IDS.snippetsButton);
    return new Proxy(
      { activeButton: defaultButton },
      {
        set: (obj, prop, newButton) => {
          if (obj.activeButton === newButton) return true;
          obj.activeButton.classList.remove('active');
          newButton.classList.add('active');
          obj.activeButton = newButton;
          this.updateVisibleSection();
          return true;
        },
      }
    );
  }

  handleSearch(e) {
    this.noMoreSnippets = false;
    if (this.isInFolder()) {
      const title = e.target.value.toLowerCase();
      this.searchParams.title = title;

      const filtered = this.currentSnippetsView.snippets.filter((snippet) => {
        const matchesTitle = snippet.title.toLowerCase().includes(title);
        const matchesLanguage = this.searchParams.language
          ? snippet.language === this.searchParams.language
          : true;
        return matchesTitle && matchesLanguage;
      });
      document.getElementById(DOM_IDS.snippetsContainer).innerHTML = '';
      this.renderSnippets(filtered);
    } else {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.searchParams.title = e.target.value;

        this.currentSnippetsView = { currentPage: 1, snippets: [] };
        document.getElementById(DOM_IDS.snippetsContainer).innerHTML = '';
        this.loadSnippets();
      }, 500);
    }
  }

  init() {
    for (const folderId in this.folders) {
      this.createFolderButton(folderId);
    }

    this.addClickListener(DOM_IDS.settingsButton, (e) => {
      this.handlePageNavigation(
        document.getElementById(DOM_IDS.settingsButton)
      );
    });
    this.addClickListener(DOM_IDS.snippetsButton, (e) => {
      this.handlePageNavigation(
        document.getElementById(DOM_IDS.snippetsButton)
      );
    });
    this.addClickListener(DOM_IDS.gridViewButton, this.handleViewToggle);
    this.addClickListener(DOM_IDS.listViewButton, this.handleViewToggle);
    document
      .getElementById('snippets-searchInput')
      .addEventListener('input', this.handleSearch);
    this.addClickListener(DOM_IDS.newFolderButton, () => {
      this.createFolderButton();
    });
    document
      .getElementById('select-language')
      .addEventListener('change', (e) => {
        this.noMoreSnippets = false;
        this.searchParams.language = e.target.value;

        if (this.isInFolder()) {
          const filtered = this.currentSnippetsView.snippets.filter(
            (snippet) => {
              const matchesTitle = snippet.title.toLowerCase().includes(title);
              const matchesLanguage = this.searchParams.language
                ? snippet.language === this.searchParams.language
                : true;
              return matchesTitle && matchesLanguage;
            }
          );
          document.getElementById(DOM_IDS.snippetsContainer).innerHTML = '';
          this.renderSnippets(filtered);
        } else {
          this.currentSnippetsView = { currentPage: 1, snippets: [] };
          document.getElementById(DOM_IDS.snippetsContainer).innerHTML = '';
          this.loadSnippets();
        }
      });
    let isLoading = false;
    const snippetsContainer = document.getElementById(
      DOM_IDS.snippetsContainer
    );
    snippetsContainer.addEventListener('scroll', (e) => {
      if (this.isInFolder()) return;

      // if we’re already fetching, do nothing
      if (isLoading || this.noMoreSnippets) return;

      // have we scrolled to within 10px of the bottom?
      if (
        snippetsContainer.scrollTop + snippetsContainer.clientHeight >=
        snippetsContainer.scrollHeight - 10
      ) {
        isLoading = true;
        // loadSnippets will append the next page into currentSnippetsView.snippets
        this.loadSnippets()
          .catch(console.error)
          .finally(() => {
            isLoading = false;
          });
      }
    });

    this.loadSnippets();

    window.addEventListener('message', (event) => {
      const { type } = event.data;
      if (type === 'shutdown') {
        localStorage.setItem('folders', JSON.stringify(this.folders));
      }
    });
  }

  addClickListener(id, handler) {
    const element = document.getElementById(id);
    if (element) element.addEventListener('click', handler);
  }

  addSnippetToFolder(folderId, snippetId) {
    const folder = this.folders[folderId];
    if (!folder) return;

    if (!folder.snippets.includes(snippetId)) {
      folder.snippets.push(snippetId);
    }
  }
  deleteFolder(folderId) {
    const tempFolders = {};

    const deletedId = parseInt(folderId);

    // Copy and shift folders
    for (const id in this.folders) {
      const currentId = parseInt(id);
      if (currentId < deletedId) {
        tempFolders[currentId] = this.folders[id];
      } else if (currentId > deletedId) {
        tempFolders[currentId - 1] = this.folders[id];
      }
    }

    this.folders = tempFolders;

    this.pageState.activeButton = document.getElementById(
      DOM_IDS.snippetsButton
    );
    document.getElementById(DOM_IDS.folderButtonsContainer).innerHTML = '';

    for (const id in this.folders) {
      this.createFolderButton(id);
    }
  }

  createFolderButton(folderId) {
    const container = document.getElementById(DOM_IDS.folderButtonsContainer);
    const folderIndex = folderId ?? container.childNodes.length + 1;
    const folderData = this.folders[folderId] || {
      folderName: `Folder ${folderIndex}`,
      snippets: [],
    };

    const button = document.createElement('button');
    button.className = 'btn w-full folder-btn';
    button.setAttribute('data-folderid', folderIndex);
    button.id = DOM_IDS.snippetsButton;

    const folderIconSVG = `
    <svg width="16"  height="16" viewBox="0 0 16 16" fill="var(--vscode-foreground)" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13h-12V7h4.49l.35-.15.86-.86H14v1.5l-.01 4zm0-6.49h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99z"/>
    </svg>`;

    const closeIconSVG = ` 
    <svg xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.11641 7.99992L2.55835 12.558L3.44223 13.4419L8.00029 8.88381L12.5583 13.4419L13.4422 12.558L8.88417 7.99992L13.4422 3.44187L12.5583 2.55798L8.00029 7.11604L3.44223 2.55798L2.55835 3.44187L7.11641 7.99992Z" fill="var(--vscode-foreground)"/>
    </svg>`;

    // Editable Title Element
    const titleSpan = document.createElement('span');
    titleSpan.textContent = folderData.folderName;
    titleSpan.contentEditable = false;
    titleSpan.className = 'folder-title';
    titleSpan.style.marginInline = '5px';
    titleSpan.style.outline = 'none';
    titleSpan.style.cursor = 'pointer';
    titleSpan.style.wordBreak = 'break-all';

    titleSpan.addEventListener('click', (e) => {
      if (button.classList.contains('active')) {
        e.stopPropagation();
        titleSpan.contentEditable = true;
        titleSpan.focus();
      }
    });

    titleSpan.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        titleSpan.blur();
      }
    });

    titleSpan.addEventListener('blur', () => {
      const newTitle = titleSpan.textContent.trim();
      if (newTitle.length > 0) {
        folderData.folderName = newTitle;
        this.folders[folderIndex] = folderData;
      } else {
        titleSpan.textContent = folderData.folderName;
      }
      titleSpan.contentEditable = false;
    });

    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-folder-btn';
    deleteBtn.innerHTML = closeIconSVG;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteFolder(folderIndex);
    });

    const iconWrapper = document.createElement('span');
    iconWrapper.innerHTML = folderIconSVG;

    button.appendChild(iconWrapper);
    button.appendChild(titleSpan);
    button.appendChild(deleteBtn);

    button.addEventListener('click', (e) => {
      this.handlePageNavigation(button);
    });

    // Drag and drop handlers
    button.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    button.addEventListener('drop', (e) => {
      e.preventDefault();
      const snippetId = e.dataTransfer.getData('text/plain');
      if (!snippetId) return;
      this.addSnippetToFolder(folderIndex, snippetId);
    });

    // Create folder in data if it doesn't exist
    if (!this.folders[folderIndex]) {
      this.folders[folderIndex] = folderData;
    }

    container.appendChild(button);
  }

  async loadSnippets() {
    const folderId = this.pageState.activeButton?.dataset.folderid;
    let newSnippets;
    if (folderId) {
      newSnippets = await this.fetchFolderSnippets(folderId);
      this.currentSnippetsView.snippets = newSnippets;
    } else {
      newSnippets = await this.fetchDiscoverSnippets(
        this.currentSnippetsView.currentPage,
        this.searchParams.title,
        this.searchParams.language
      );
      this.currentSnippetsView.snippets.push(...newSnippets);
    }

    const lastSnippet =
      this.currentSnippetsView.snippets[
        this.currentSnippetsView.snippets.length - 1
      ];
    if (typeof lastSnippet === typeof '') {
      document.getElementById(DOM_IDS.snippetsContainer).innerHTML =
        lastSnippet;
      return;
    }

    if (newSnippets.length === 0) {
      this.noMoreSnippets = true;
      return;
    }

    this.renderSnippets(newSnippets);
  }

  updateVisibleSection() {
    const { id } = this.pageState.activeButton;

    switch (id) {
      case DOM_IDS.snippetsButton:
        this.currentSnippetsView = { currentPage: 1, snippets: [] };
        document.getElementById(DOM_IDS.snippetsContainer).innerHTML = '';
        document.getElementById('settings-page').style.display = 'none';
        document.getElementById('snippets-page').style.display = 'flex';

        this.loadSnippets();
        break;

      case DOM_IDS.settingsButton:
        document.getElementById('snippets-page').style.display = 'none';
        document.getElementById('settings-page').style.display = 'flex';
        break;
    }
  }

  handlePageNavigation(button) {
    this.pageState.activeButton = button;
  }

  handleViewToggle(e) {
    const viewType = e.target.id === DOM_IDS.gridViewButton ? 'grid' : 'list';
    if (viewType === this.activeViewType) return;

    const isGrid = e.target.id === DOM_IDS.gridViewButton;
    document
      .getElementById(DOM_IDS.gridViewButton)
      .classList.toggle('active', isGrid);
    document
      .getElementById(DOM_IDS.listViewButton)
      .classList.toggle('active', !isGrid);

    const container = document.getElementById(DOM_IDS.snippetsContainer);
    if (isGrid) {
      container.style.display = 'grid';
    } else {
      container.style.display = 'flex';
    }
    this.activeViewType = isGrid ? 'grid' : 'list';

    document.getElementById(DOM_IDS.snippetsContainer).innerHTML = '';

    this.renderSnippets(this.currentSnippetsView.snippets);
  }

  async fetchDiscoverSnippets(page, searchQuery, language) {
    try {
      const params = new URLSearchParams({
        page,
        limit: 30,
        ...(searchQuery.length > 0 && { title: searchQuery }),
        ...(language.length > 0 && { language }),
      });
      const response = await fetch(`${this.API_URL}/discover?${params}`);
      const json = await response.json();
      this.currentSnippetsView.currentPage += 1;
      return json.records;
    } catch (err) {
      return '<h1>Something went wrong while getting the snippets</h1>';
    }
  }

  async fetchFolderSnippets(folderId) {
    try {
      const response = await fetch(`${this.API_URL}/ids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: this.folders[folderId].snippets }),
      });
      return await response.json();
    } catch (err) {
      return '<h1>Something went wrong while getting the snippets</h1>';
    }
  }

  renderSnippets(snippets) {
    const container = document.getElementById(DOM_IDS.snippetsContainer);
    let snippetNodes = [];

    for (let i = 0; i < snippets.length; i++) {
      const snippet = snippets[i];

      if (this.activeViewType === 'grid') {
        snippetNodes.push(this.getSnippetCardComponent(snippet));
      } else {
        snippetNodes.push(this.getSnippetRowComponent(snippet));
      }
    }

    container.append(...snippetNodes);
    hljs.highlightAll();
  }

  getSnippetCardComponent(snippet) {
    const snippetNode = document.createElement('div');
    snippetNode.className = `snippet-card`;
    snippetNode.innerHTML = `
          <small>${snippet.language}</small>
          <div class="snippet-card-info">
            <h3>${snippet.title}</h3>
            <p>${snippet.description}</p>
          </div>
          <pre class="snippet-card-code-container"><code class="language-${
            snippet.language
          }" >${escapeHtml(snippet.code)}</code></pre>
          <div class="snippet-card-buttons">
            <button class='copy-snippet-btn'>Copy</button>
          </div>`;
    snippetNode
      .querySelector('.copy-snippet-btn')
      .addEventListener('click', (e) => {
        navigator.clipboard.writeText(snippet.code);
      });

    if (!this.isInFolder()) {
      snippetNode.setAttribute('draggable', 'true');
      snippetNode.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', snippet.id);
        e.dataTransfer.effectAllowed = 'move';
        snippetNode.classList.add('dragging');
      });
      snippetNode.addEventListener('dragend', () => {
        snippetNode.classList.remove('dragging');
      });
    }

    return snippetNode;
  }
  getSnippetRowComponent(snippet) {
    const snippetNode = document.createElement('div');
    snippetNode.className = `snippet-card-row`;
    snippetNode.innerHTML = `
    <div class='snippet-card-row-info'>
      <h3>${snippet.title}</h3>
      <small>${snippet.language}</small>
    </div>
    <button class='copy-snippet-btn'>Copy</button>
    `;
    snippetNode
      .querySelector('.copy-snippet-btn')
      .addEventListener('click', (e) => {
        navigator.clipboard.writeText(snippet.code);
      });

    if (!this.isInFolder()) {
      snippetNode.setAttribute('draggable', 'true');
      snippetNode.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', snippet.id);
        e.dataTransfer.effectAllowed = 'move';
        snippetNode.classList.add('dragging');
      });
      snippetNode.addEventListener('dragend', () => {
        snippetNode.classList.remove('dragging');
      });
    }
    return snippetNode;
  }
}

const DOM_IDS = {
  snippetsButton: 'snippets-btn',
  settingsButton: 'settings-btn',
  gridViewButton: 'gridView-btn',
  listViewButton: 'listView-btn',
  folderButtonsContainer: 'folder-buttons-container',
  newFolderButton: 'new-folder-btn',
  snippetsContainer: 'snippets-container',
};
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
(async function () {
  const vscode = acquireVsCodeApi();
  const app = new SnippetApp(vscode);
  app.init();
})();
