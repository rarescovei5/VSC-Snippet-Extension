import { apiService } from '../services/api.service.js';
import { stateService } from '../services/state.service.js';
import { searchComponent } from './search.js';
import { domUtils } from '../utils/dom.js';

export const snippetsComponent = {
  snippetsContainer: document.getElementById('snippets-container'),
  renderedSnippetsIds: new Set(),
  currentFolderSnippets: [],
  init() {
    this._bindContextMethods();

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
    snippetNode.querySelector('.copy-snippet-btn').addEventListener('click', (e) => {
      navigator.clipboard.writeText(snippet.code);
    });

    if (!/^folder-\d+$/.test(stateService.state.currentPath)) {
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
    snippetNode.querySelector('.copy-snippet-btn').addEventListener('click', (e) => {
      navigator.clipboard.writeText(snippet.code);
    });

    if (!/^folder-\d+$/.test(stateService.state.currentPath)) {
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
  },
};
