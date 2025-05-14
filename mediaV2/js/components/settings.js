import { apiService } from '../services/api.service.js';
import { stateService } from '../services/state.service.js';

export const settingsComponent = {
  settingsContainer: document.getElementById('settings-page'),
  importFoldersBtn: document.getElementById('import-folders-btn'),
  exportFoldersBtn: document.getElementById('export-folders-btn'),
  exportFolderSelect: document.getElementById('export-folder-select'),
  includeSnippetsCheckbox: document.getElementById('include-snippets-checkbox'),
  importStrategyRadios: document.getElementById('import-options'),

  init() {
    this._setupEventListeners();

    // Subscribe to folders changes to update the select dropdown
    stateService.subscribe('folders', () => {
      this._updateFolderSelectOptions();
    });

    // Initial population of folder select options
    this._updateFolderSelectOptions();
  },

  _setupEventListeners() {
    this.importFoldersBtn.addEventListener('click', () => {
      this._handleImportFolders();
    });

    this.exportFoldersBtn.addEventListener('click', () => {
      this._handleExportFolders();
    });
  },

  _updateFolderSelectOptions() {
    const select = this.exportFolderSelect;

    while (select.options.length > 1) {
      select.remove(1);
    }

    stateService.state.folders.forEach((folder, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = folder.folderName;
      select.appendChild(option);
    });
  },

  // KNOWN ISSUE (import): If merge is selected and there are two folders with the same name, there is a bug
  async _handleImportFolders() {
    try {
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText || clipboardText.trim() === '') return;

      try {
        const importedData = JSON.parse(clipboardText);

        if (!Array.isArray(importedData)) {
          throw new Error('Invalid format: Expected an array of folders');
        }

        let importStrategy = this.importStrategyRadios.querySelector('input:checked').value;

        const formattedData = importedData.map((folder) => {
          const newFolder = {
            folderName: folder.folderName,
            snippetIds: folder.snippetIds,
          };
          if (!folder.snippetIds || !Array.isArray(folder.snippetIds)) {
            newFolder.snippetIds = [];
          }
          if (!folder.folderName) {
            newFolder.folderName = 'Imported Folder';
          }
          return newFolder;
        });

        if (importStrategy === 'replace') {
          stateService.setFolders(formattedData);
        } else {
          const currentFolders = [...stateService.state.folders]; // Create a copy

          formattedData.forEach((folder) => {
            const existingFolderIndex = currentFolders.findIndex(
              (existing) => existing.folderName === folder.folderName
            );

            if (existingFolderIndex >= 0) {
              // Folder with same name exists, merge snippet IDs
              stateService.modifyFolderSnippets(existingFolderIndex, folder.snippetIds);
            } else {
              // New folder, add it
              stateService.addFolder(folder);
            }
          });
        }
      } catch (error) {
        console.error('Import error:', error);
      }
    } catch (error) {
      console.error('Clipboard access error:', error);
    }
  },

  async _handleExportFolders() {
    try {
      const selectedValue = this.exportFolderSelect.value;
      console.log(selectedValue);
      let foldersToExport = [];

      if (selectedValue === 'all') {
        // Export all folders
        foldersToExport = JSON.parse(JSON.stringify(stateService.state.folders));
      } else {
        // Export just the selected folder
        const folderIndex = parseInt(selectedValue);
        const selectedFolder = stateService.state.folders[folderIndex];

        if (selectedFolder) {
          foldersToExport = [JSON.parse(JSON.stringify(selectedFolder))];
        } else {
          console.log('Selected folder not found');
        }
      }

      // Create JSON string
      const jsonData = JSON.stringify(foldersToExport, null, 2);

      // Copy to clipboard
      await navigator.clipboard.writeText(jsonData);
    } catch (error) {
      console.error('Export error:', error);
    }
  },
};
