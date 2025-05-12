import { stateService } from '../services/state.service.js';
import { domUtils } from '../utils/dom.js';
import { redirectTo } from '../utils/state.js';
export const foldersComponent = {
  foldersContainer: document.getElementById('folder-buttons-container'),
  init() {
    this.loadStateFolders();

    // If any changes to folder array rebuild the folder buttons
    stateService.subscribe('folders', () => {
      this.loadStateFolders();
    });

    // Make the New Folder (button) create new folders
    document.getElementById('new-folder-btn').addEventListener('click', () => {
      this.createNewFolder();
    });
  },
  loadStateFolders() {
    this.foldersContainer.innerHTML = '';
    for (let i = 0; i < stateService.state.folders.length; i++) {
      this.renderFolderButton(i);
    }
  },
  createNewFolder() {
    const newFolderData = {
      folderName: `Folder ${stateService.state.folders.length + 1}`,
      snippets: [],
    };
    stateService.addFolder(newFolderData);
  },
  renderFolderButton(folderIdx) {
    const folderIndex = folderIdx;
    const folderData = stateService.state.folders[folderIndex];

    // Create Button
    const button = domUtils.createElement('button', {
      classes: ['nav-button'],
      attributes: { 'data-folderid': folderIndex },
    });

    // Navigation
    button.addEventListener('click', (e) => {
      redirectTo(`folder-${folderIndex}`);
    });

    // Drag and drop (snippets) handlers
    button.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    button.addEventListener('drop', (e) => {
      e.preventDefault();
      const snippetId = e.dataTransfer.getData('text/plain');
      if (!snippetId) return;
      stateService.addSnippetToFolder(folderIndex, snippetId);
    });

    // Folder Icon
    const folderIconSVG = `
    <svg width="16"  height="16" viewBox="0 0 16 16" fill="var(--vscode-foreground)" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13h-12V7h4.49l.35-.15.86-.86H14v1.5l-.01 4zm0-6.49h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99z"/>
    </svg>`;
    const folderIconWrapper = domUtils.createElement('span', {
      html: folderIconSVG,
    });
    button.appendChild(folderIconWrapper);

    // Editable Title Element
    const titleSpan = domUtils.createElement('span', {
      text: `${folderData.folderName}`,
      classes: ['folder-title'],
    });
    titleSpan.contentEditable = false;
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
        stateService.renameFolder(folderIndex, newTitle);
      } else {
        titleSpan.textContent = folderData.folderName;
      }
      titleSpan.contentEditable = false;
    });
    button.appendChild(titleSpan);

    // Delete Folder Button
    const closeIconSVG = ` 
    <svg xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.11641 7.99992L2.55835 12.558L3.44223 13.4419L8.00029 8.88381L12.5583 13.4419L13.4422 12.558L8.88417 7.99992L13.4422 3.44187L12.5583 2.55798L8.00029 7.11604L3.44223 2.55798L2.55835 3.44187L7.11641 7.99992Z" fill="var(--vscode-foreground)"/>
    </svg>`;
    const deleteBtn = domUtils.createElement('div', {
      classes: ['delete-folder-btn'],
      html: closeIconSVG,
    });
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stateService.removeFolder(folderIndex);
    });
    button.appendChild(deleteBtn);

    this.foldersContainer.appendChild(button);
  },
};
