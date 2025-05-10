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
  }

  bindContextMethods() {
    this.handlePageNavigation = this.handlePageNavigation.bind(this);
    this.handleViewToggle = this.handleViewToggle.bind(this);
    this.createFolderButton = this.createFolderButton.bind(this);
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

  init() {
    for (const folderId in this.folders) {
      this.createFolderButton(folderId);
    }

    this.addClickListener(DOM_IDS.settingsButton, this.handlePageNavigation);
    this.addClickListener(DOM_IDS.snippetsButton, this.handlePageNavigation);
    this.addClickListener(DOM_IDS.gridViewButton, this.handleViewToggle);
    this.addClickListener(DOM_IDS.listViewButton, this.handleViewToggle);
    this.addClickListener(DOM_IDS.newFolderButton, () => {
      this.createFolderButton();
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

  createFolderButton(folderId) {
    const container = document.getElementById(DOM_IDS.folderButtonsContainer);
    const folderIndex = folderId ?? container.childNodes.length + 1;

    const button = document.createElement('button');
    const folderName = folderId
      ? `${this.folders[folderId].folderName}`
      : `Folder ${folderIndex}`;

    const iconSVG = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13h-12V7h4.49l.35-.15.86-.86H14v1.5l-.01 4zm0-6.49h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99z"/>
      </svg>`;

    button.innerHTML = `${iconSVG}${folderName}`;
    button.className = 'btn btn-w-icon w-full';
    button.setAttribute('data-folderid', folderIndex);
    button.id = DOM_IDS.snippetsButton;
    button.addEventListener('click', this.handlePageNavigation);

    if (!folderId) {
      this.folders[folderIndex] = { folderName, snippets: [] };
    }

    container.appendChild(button);
  }

  async loadSnippets(folderId) {
    if (folderId) {
      this.currentSnippetsView.snippets = await this.fetchFolderSnippets(
        folderId
      );
    } else {
      this.currentSnippetsView.snippets.push(
        ...(await this.fetchDiscoverSnippets(
          this.currentSnippetsView.currentPage
        ))
      );
    }

    this.renderSnippets(this.currentSnippetsView.snippets);
  }

  updateVisibleSection() {
    const { id } = this.pageState.activeButton;

    switch (id) {
      case DOM_IDS.snippetsButton:
        this.currentSnippetsView = { currentPage: 1, snippets: [] };
        document.getElementById(DOM_IDS.snippetsContainer).innerHTML = '';
        document.getElementById('settings-page').style.display = 'none';
        document.getElementById('snippets-page').style.display = 'flex';

        const folderId = this.pageState.activeButton.dataset.folderid;
        this.loadSnippets(folderId);
        break;

      case DOM_IDS.settingsButton:
        document.getElementById('snippets-page').style.display = 'none';
        document.getElementById('settings-page').style.display = 'flex';
        break;
    }
  }

  handlePageNavigation(e) {
    this.pageState.activeButton = e.target;
  }

  handleViewToggle(e) {
    if (e.target.id === this.activeViewType) return;

    const isGrid = e.target.id === DOM_IDS.gridViewButton;

    document
      .getElementById(DOM_IDS.gridViewButton)
      .classList.toggle('active', isGrid);
    document
      .getElementById(DOM_IDS.listViewButton)
      .classList.toggle('active', !isGrid);
    this.activeViewType = isGrid ? 'grid' : 'list';
  }

  async fetchDiscoverSnippets(page, searchQuery, language) {
    try {
      const params = new URLSearchParams({
        page,
        limit: 16,
        ...(searchQuery && { title: searchQuery }),
        ...(language && { language }),
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
      }
    }

    container.append(...snippetNodes);
    hljs.highlightAll();
  }

  getSnippetCardComponent(snippet) {
    const snippetNode = document.createElement('div');
    snippetNode.className = `snippet-card-wrapper`;
    snippetNode.innerHTML = `
         <div class="snippet-card">
          <small>${snippet.language}</small>
          <div class="snippet-card-info">
            <h3>${snippet.title}</h3>
            <p>${snippet.description}</p>
          </div>
          <pre class="snippet-card-code-container">
            <code class="language-${snippet.language}">${snippet.code}</code>
          </pre>
          <div class="snippet-card-buttons">
            <div><button class='btn save-btn'>Save</button></div>
            <button class='copy-snippet-btn'>Copy</button>
          </div>
        </div>
    `;
    snippetNode
      .querySelector('.copy-snippet-btn')
      .addEventListener('click', (e) => {
        navigator.clipboard.writeText(snippet.code);
      });

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

(async function () {
  const vscode = acquireVsCodeApi();
  const app = new SnippetApp(vscode);
  app.init();
})();
