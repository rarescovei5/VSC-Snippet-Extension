import { VscCode, VscFolder, VscGear, VscSymbolFile } from 'react-icons/vsc';
import { Link, Outlet } from '../ContextRouter';
import { useRouter } from '../ContextRouter/utilities/useRouter';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addFolder, addRemoteSnippets } from '../app/folders/foldersSlice';
import type { Uuid } from '../types/types';
import React from 'react';

const AppLayout = () => {
  const dispatch = useAppDispatch();
  const folders = useAppSelector((state) => state.folders);

  const [dragOverFolder, setDragOverFolder] = React.useState<number | null>(null);

  const { path } = useRouter();

  const handleFolderDrop = (e: React.DragEvent<HTMLAnchorElement>, folderIdx: number) => {
    e.preventDefault(); // 1) allow the drop
    const json = e.dataTransfer.getData('application/json');
    if (!json) return;

    try {
      const snippetIds: Uuid[] = JSON.parse(json);
      // dispatch your action to move these snippets into folderIdx
      dispatch(addRemoteSnippets({ folderIdx, snippetIds }));
    } catch {
      console.error('Failed to parse dropped snippet IDs');
    }

    setDragOverFolder(null);
  };
  const handleDragOver = (e: React.DragEvent<HTMLElement>, idx: number) => {
    e.preventDefault();
    setDragOverFolder(idx);
  };
  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  return (
    <div className="h-svh flex justify-between bg-background overflow-hidden">
      <aside className="flex flex-col h-full flex-1/4 border-r border-border">
        <div className="flex p-4 border-b border-border gap-2 items-center text-xl font-medium !text-text">
          <VscCode size={16} />
          <h1>Code Snippets</h1>
        </div>
        <div className="flex-1 flex p-1 border-b border-border gap-1 flex-col overflow-y-auto">
          <Link
            to="/settings"
            className={`flex gap-2 items-center rounded-sm border text-base !text-text p-3 ${
              path === '/settings' ? 'bg-card border-border' : 'border-transparent hover:bg-card/50 cursor-pointer'
            }`}
          >
            <VscGear size={16} />
            <span>Settings</span>
          </Link>
          <Link
            to="/snippets"
            className={`flex gap-2 items-center rounded-sm border text-base !text-text p-3 ${
              path === '/snippets' ? 'bg-card border-border' : 'border-transparent hover:bg-card/50 cursor-pointer'
            }`}
          >
            <VscSymbolFile size={16} />
            <span>Snippets</span>
          </Link>
          {folders.map((folder, idx) => (
            <Link
              key={idx}
              onDrop={(e) => handleFolderDrop(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              to={`/snippets/folders/${idx}`}
              className={`flex gap-2 items-center rounded-sm border text-base !text-text p-3 ${
                path === `/snippets/folders/${idx}`
                  ? 'bg-card border-border'
                  : 'border-transparent hover:bg-card/50 cursor-pointer'
              }
              ${dragOverFolder === idx && 'ring-2 ring-text'}`}
            >
              <VscFolder />
              {folder.name}
            </Link>
          ))}
        </div>
        <div className="p-1 !text-text">
          <button
            onClick={() => dispatch(addFolder({ name: 'New Folder' }))}
            className="w-full text-center cursor-pointer text-lg border border-border p-3 rounded-sm"
          >
            New Folder
          </button>
        </div>
      </aside>
      <main className="h-full flex-3/4">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
