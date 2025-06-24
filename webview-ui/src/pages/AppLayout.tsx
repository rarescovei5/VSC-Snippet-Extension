import { VscClose, VscCode, VscFolder, VscGear, VscSymbolFile } from 'react-icons/vsc';
import { Link, Outlet } from '../ContextRouter';
import { useRouter } from '../ContextRouter/utilities/useRouter';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addFolder, addSnippets, deleteFolder, setFolderName, type FolderSnippets } from '../app/folders/foldersSlice';
import type { LocalSnippet, Prettify, Uuid } from '../types/types';
import React from 'react';
import { useModal } from '../components/ModalProvider';

const AppLayout = () => {
  const modalCtx = useModal();

  const dispatch = useAppDispatch();
  const folders = useAppSelector((state) => state.folders);

  const [dragOverFolder, setDragOverFolder] = React.useState<number | null>(null);

  const { path, navigate } = useRouter();

  const handleFolderDrop = (e: React.DragEvent<HTMLAnchorElement>, folderIdx: number) => {
    e.preventDefault();
    const json = e.dataTransfer.getData('application/x-folder-snippets');
    if (!json) return;

    try {
      const folderSnippets: FolderSnippets = JSON.parse(json);
      // dispatch your action to move these snippets into folderIdx
      dispatch(addSnippets({ folderIdx, snippets: folderSnippets }));
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
  const commitFolderName = (target: HTMLSpanElement, idx: number) => {
    if (target.innerText.trim()) {
      dispatch(setFolderName({ folderIdx: idx, newFolderName: target.innerText }));
    }
    setActiveFolderEditIdx(-1);
  };

  const [activeFolderEditIdx, setActiveFolderEditIdx] = React.useState(-1);

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
          {folders.map((folder, idx) => {
            const matchesPath = path === `/snippets/folders/${idx}`;

            return (
              <Link
                key={idx}
                to={`/snippets/folders/${idx}`}
                className={`group flex relative pr-8 gap-2 items-center rounded-sm border text-base !text-text p-3 ${
                  matchesPath ? 'bg-card border-border' : 'border-transparent hover:bg-card/50 cursor-pointer'
                }
              ${dragOverFolder === idx && 'ring-2 ring-text'}
              ${activeFolderEditIdx === idx && 'border-dashed border-text'}`}
                // Drop Snippets Logic
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleFolderDrop(e, idx)}
                onDragLeave={handleDragLeave}
              >
                <VscFolder />
                <span
                  className="outline-none"
                  //Edit Name Logic
                  onDoubleClick={(e) => {
                    setActiveFolderEditIdx(idx);
                    requestAnimationFrame(() => (e.target as HTMLSpanElement).focus());
                  }}
                  contentEditable={activeFolderEditIdx === idx}
                  suppressContentEditableWarning
                  onBlur={(e) => commitFolderName(e.target as HTMLSpanElement, idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitFolderName(e.target as HTMLSpanElement, idx);
                    }
                  }}
                >
                  {activeFolderEditIdx === idx ? '' : folder.name}
                </span>
                {matchesPath && (
                  <VscClose
                    className="absolute right-2 top-1/2 -translate-y-1/2 group-hover:block hidden cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (folder.items.length) {
                        modalCtx.open(
                          <>
                            <h2 className="text-lg font-semibold">Delete "{folder.name}"?</h2>
                            <p className="text-sm text-text-muted leading-relaxed max-w-sm">
                              This action is <span className="font-medium text-red-500">irreversible</span>. All
                              contents within this folder will be permanently removed. Please proceed with caution.
                            </p>
                            <button
                              className="border-red-500 border bg-red-500 px-3 py-1 rounded-sm mr-4 cursor-pointer"
                              onClick={() => {
                                modalCtx.close();
                                dispatch(deleteFolder({ folderIdx: idx }));
                                navigate('/snippets');
                              }}
                            >
                              Delete
                            </button>
                          </>
                        );
                      } else {
                        dispatch(deleteFolder({ folderIdx: idx }));
                        navigate('/snippets');
                      }
                    }}
                  />
                )}
              </Link>
            );
          })}
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
