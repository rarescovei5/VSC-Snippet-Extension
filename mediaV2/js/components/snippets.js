import { apiService } from '../services/api.service.js';
import { stateService } from '../services/state.service.js';
import { searchComponent } from './search.js';
import { domUtils } from '../utils/dom.js';

export const snippetsComponent = {
  snippetsContainer: document.getElementById('snippets-container'),
  removeBtnContainer: document.getElementById('remove-snippet-container'),
  renderedSnippetsIds: new Set(),
  currentFolderSnippets: [],
  init() {
    this._bindContextMethods();
    this.createRemoveFromFolderBtn();

    let scrollHandler = searchComponent.createInfiniteScrollHandler();
    scrollHandler = scrollHandler.bind(this);

    this.snippetsContainer.addEventListener('scroll', scrollHandler);

    stateService.subscribe('currentPath', this._handleMount);
    stateService.subscribe('viewMode', () => {
      this.snippetsContainer.innerHTML = '';
      this.renderedSnippetsIds.clear();
      this.renderSnippets(stateService.state.snippets);
    });
    stateService.subscribe('snippets', () => {
      this.renderSnippets(stateService.state.snippets);
    });
  },
  createRemoveFromFolderBtn() {
    const button = domUtils.createElement('div', {
      classes: 'icon-btn remove-snippet-button'.split(' '),
      html: ` <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          fill="var(--vscode-editor-foreground)"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
          />
        </svg>`,
    });

    button.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    button.addEventListener('drop', (e) => {
      e.preventDefault();
      const folderID = parseInt(stateService.state.currentPath.split('-')[1]);

      const snippetId = e.dataTransfer.getData('text/plain');
      if (!snippetId) return;

      stateService.removeSnippetFromFolder(folderID, snippetId);
    });

    stateService.subscribe(`folders-snippets-remove`, () => {
      const folderID = parseInt(stateService.state.currentPath.split('-')[1]);
      let deletedSnippetId;
      // Filter the currentFolderSnippets array to reflect the updated list
      this.currentFolderSnippets = this.currentFolderSnippets.filter((snippet) => {
        const isSnippetKept = stateService.state.folders[folderID].snippetIds.some((id) => id === snippet.id);
        if (!isSnippetKept) deletedSnippetId = snippet.id;
        return isSnippetKept;
      });

      this.renderedSnippetsIds.delete(deletedSnippetId);
      this.snippetsContainer.querySelector(`[data-snippetid="${deletedSnippetId}"]`).remove();
      stateService.setSnippets(this.currentFolderSnippets);
    });

    this.removeBtnContainer.appendChild(button);
  },

  _bindContextMethods() {
    this._handleMount = this._handleMount.bind(this);
    this._reset = this._reset.bind(this);
    this.renderSnippets = this.renderSnippets.bind(this);
  },
  _reset() {
    this.renderedSnippetsIds.clear();
    this.snippetsContainer.innerHTML = '';
    this.lastSnippets = [];
    searchComponent.cosmetic.currentPage = 1;
    searchComponent.cosmetic.bKeepRequesting = true;
  },
  _handleMount() {
    this._reset();

    document.querySelector('.remove-snippet-button').style.display = 'none';

    switch (stateService.state.currentPath) {
      case 'settings':
        break;
      case 'snippets':
        apiService.getDiscoverSnippets().then((data) => {
          if (data.totalPages === data.currentPage) searchComponent.cosmetic.bKeepRequesting = false;
          stateService.setSnippets(data.records);
        });
        break;
      default:
        if (!/^folder-\d+$/.test(stateService.state.currentPath)) return;
        document.querySelector('.remove-snippet-button').style.display = 'grid';
        const folderID = parseInt(stateService.state.currentPath.split('-')[1]);

        apiService.getSnippetsByIds(folderID).then((data) => {
          this.currentFolderSnippets = data;
          searchComponent.filterSnippets();
        });

        break;
    }
  },
  renderSnippets(snippets) {
    // Filter only new snippets
    const newSnippets = snippets.filter((snippet) => !this.renderedSnippetsIds.has(snippet.id));

    let snippetNodes = [];

    for (const snippet of newSnippets) {
      if (stateService.state.viewMode === 'grid') {
        snippetNodes.push(this.getSnippetCardComponent(snippet));
      } else {
        snippetNodes.push(this.getSnippetRowComponent(snippet));
      }

      // Track the snippet as rendered
      this.renderedSnippetsIds.add(snippet.id);
    }

    this.snippetsContainer.append(...snippetNodes);
    hljs.highlightAll();
  },

  getSnippetCardComponent(snippet) {
    const snippetNode = document.createElement('div');
    snippetNode.className = `snippet-card`;
    snippetNode.innerHTML = `
          <small>${snippet.language}</small>
          <div class="snippet-card-info">
            <h3>${snippet.title}</h3>
            <p>${snippet.description}</p>
          </div>
          <pre class="snippet-card-code-container"><code class="language-${snippet.language}" >${domUtils.escapeHtml(
      snippet.code
    )}</code></pre>
          <div class="snippet-card-buttons">
            <button class='copy-snippet-btn'>Copy</button>
          </div>`;

    snippetNode.setAttribute('data-snippetid', snippet.id);
    snippetNode.querySelector('.copy-snippet-btn').addEventListener('click', (e) => {
      navigator.clipboard.writeText(snippet.code);
    });

    this.addDragOver(snippetNode, snippet.id);

    return snippetNode;
  },
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

    snippetNode.setAttribute('data-snippetid', snippet.id);
    snippetNode.querySelector('.copy-snippet-btn').addEventListener('click', (e) => {
      navigator.clipboard.writeText(snippet.code);
    });

    this.addDragOver(snippetNode, snippet.id);

    return snippetNode;
  },
  addDragOver(el, snippetId) {
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', snippetId);
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
    });
  },
};
