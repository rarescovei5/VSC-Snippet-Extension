import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { VscError } from 'react-icons/vsc';
import * as settingsActions from '../app/settings/settingsSlice';
import { importFolders } from '../app/folders/foldersSlice';

/**
 * @param pageSize number
 * @return **true** if `pageSize` is valid, otherwise **false**
 */
function parsePageSize(pageSize: string) {
  const nPageSize = Number(pageSize);
  return Number.isInteger(nPageSize) && nPageSize >= 10 && nPageSize <= 100;
}

const SettingsPage = () => {
  const dispatch = useAppDispatch();

  const folders = useAppSelector((state) => state.folders);

  const { pageSize: settings_pageSize } = useAppSelector((state) => state.settings.apiConfig);
  const { showLineNumbers: settings_showLineNumbers } = useAppSelector((state) => state.settings.appearance);

  const [pageSizeError, setPageSizeError] = React.useState('');

  return (
    <div className="h-full flex flex-col !text-text p-4">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>

      <h3 className="text-xl font-medium mb-4">API Configuration</h3>
      <div className="flex flex-col mb-6 space-y-2">
        <label className="text-lg font-medium" htmlFor="page-size">
          Page Size
        </label>
        <p className="text-text-muted text-sm">Controls how many snippets are requested per page</p>
        <input
          id="page-size"
          defaultValue={settings_pageSize}
          onChange={(e) => {
            const value = e.target.value;

            if (parsePageSize(value)) {
              setPageSizeError('');
            } else {
              setPageSizeError('Page size must be an integer between 10 and 100.');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLElement).blur();
            }
          }}
          onBlur={(e) => {
            if (parsePageSize(e.target.value))
              dispatch(settingsActions.setPageSize({ newPageSize: Number(e.target.value) }));
          }}
          min={10}
          max={100}
          className="max-w-xs px-3 py-2 bg-card border border-border rounded-sm outline-none"
        />
        {pageSizeError && (
          <p className="text-red-600 flex items-center gap-1">
            <VscError size={16} /> <span>{pageSizeError}</span>
          </p>
        )}
      </div>

      <h3 className="text-xl font-medium mb-4">Appearance</h3>
      <div className="flex flex-col mb-6 space-y-2">
        <label className="text-lg font-medium" htmlFor="page-size">
          Line Numbers
        </label>
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={settings_showLineNumbers}
            onChange={(e) => dispatch(settingsActions.setShowLineNumbers({ newShowLineNumbers: e.target.checked }))}
          />
          <p className="text-text-muted text-sm">Controls wheter or not line numbers get displayed in code snippets</p>
        </div>
      </div>

      <h3 className="text-xl font-medium mb-4">Folders</h3>
      <div className="flex flex-col items-start mb-4 space-y-2">
        <label className="text-lg font-medium" htmlFor="page-size">
          Export Folders
        </label>
        <p className="text-text-muted text-sm">Copies to your clipboard the JSON representation of your folders.</p>
        <button
          className="px-3 py-1 border border-border rounded-sm cursor-pointer hover:bg-border/10 active:bg-border/50"
          onClick={() => navigator.clipboard.writeText(JSON.stringify(folders))}
        >
          Export
        </button>
      </div>
      <div className="flex flex-col items-start mb-6 space-y-2">
        <label className="text-lg font-medium" htmlFor="page-size">
          Import Folders
        </label>
        <p className="text-text-muted text-sm"> Paste a JSON string to import folders into your workspace.</p>
        <button
          onClick={async () => {
            const json = await navigator.clipboard.readText();
            dispatch(importFolders({ folders: JSON.parse(json) }));
          }}
          className="px-3 py-1 border border-border rounded-sm cursor-pointer hover:bg-border/10 active:bg-border/50"
        >
          Import
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
