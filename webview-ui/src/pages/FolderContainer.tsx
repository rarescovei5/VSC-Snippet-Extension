import React from 'react';
import { LocalSnippetCard, RemoteSnippetCard } from '../components/SnippetCard';
import { gridStyles, QueryContext } from './SnippetsLayout';
import { VscAdd, VscFiles, VscSearchStop, VscTrash } from 'react-icons/vsc';
import SelectionProvider from '../components/SelectionProvider';
import { useFolderSnippets } from '../hook/useFolderSnippets';
import { EmptyState } from '../components/EmptyState';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useParams } from '../ContextRouter/utilities/useParams';
import { addSnippets, deleteSnippets, setLocalSnippet } from '../app/folders/foldersSlice';
import { useRouter } from '../ContextRouter/utilities/useRouter';
import LanguageSelect from '../components/LanguageSelect';

const FolderContainer = () => {
  const dispatch = useAppDispatch();

  const folderIdx = Number(useParams().folderId);
  const folderData = useAppSelector((s) => s.folders[folderIdx]);
  const { selectedLanguage, titleQuery } = React.useContext(QueryContext);
  const { isEmpty, hasResults, snippets } = useFolderSnippets(titleQuery, selectedLanguage, folderData);

  // Local Snippet Editing Related
  const [editingLocalIdx, setEditingLocalIdx] = React.useState(-1);
  const [newLanguage, setNewLangauge] = React.useState('');
  const [newTitle, setNewTitle] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [newCode, setNewCode] = React.useState('');

  const { path } = useRouter();
  React.useEffect(() => {
    setEditingLocalIdx(-1);
  }, [path]);

  return (
    <SelectionProvider>
      {editingLocalIdx === -1 ? (
        <>
          {/* Snippets  */}
          <div style={gridStyles} className="h-full grid gap-1 p-1 overflow-y-auto">
            {snippets.map((snip, idx) =>
              snip.kind === 'local' ? (
                <LocalSnippetCard
                  key={idx}
                  idx={snip.idx}
                  code={snip.code ?? ''}
                  description={snip.description}
                  language={snip.language}
                  title={snip.title}
                  editSnippet={() => {
                    console.log(snip.idx);
                    setEditingLocalIdx(snip.idx);
                    setNewLangauge(snip.language);
                    setNewTitle(snip.title);
                    setNewDescription(snip.description ?? '');
                    setNewCode(snip.code ?? '');
                  }}
                />
              ) : (
                <RemoteSnippetCard
                  key={idx}
                  idx={snip.idx}
                  code={snip.code ?? ''}
                  description={snip.description}
                  language={snip.language}
                  title={snip.title}
                />
              )
            )}

            {isEmpty ? (
              <EmptyState
                icon={<VscFiles size={48} />}
                title="This Folder is Empty"
                message="Find snippets on the Discovery page and drag them here from the sidebar."
              />
            ) : // Not Found | Condition: If no results prompt user to change filters
            !hasResults ? (
              <EmptyState
                icon={<VscSearchStop size={48} />}
                title="No Snippets Found!"
                message="Try adjusting your filters"
              />
            ) : (
              <></>
            )}
          </div>
          {/* Add local snippets | Delete Snippets */}
          <div className="flex gap-3 z-10 absolute right-3 bottom-3">
            <div
              className="bg-card border border-border p-3 rounded-sm !text-text cursor-pointer"
              onClick={() => {
                dispatch(
                  addSnippets({
                    folderIdx,
                    snippets: [
                      {
                        kind: 'local',
                        code: `print("Hello World!")`,
                        description: 'A program that prints out "Hello World!" to the screen',
                        title: 'Simple Python Script',
                        language: 'python',
                      },
                    ],
                  })
                );
              }}
            >
              <VscAdd />
            </div>
            {!isEmpty && (
              <div
                className="bg-card border border-border p-3 rounded-sm !text-text"
                onDrop={(e) => {
                  e.preventDefault();
                  const json = e.dataTransfer.getData('application/x-deleted-snippets');
                  if (!json) return;

                  try {
                    const snippetIdxs: number[] = JSON.parse(json);
                    // dispatch your action to move these snippets into folderIdx
                    dispatch(deleteSnippets({ folderIdx, snippetIdxs }));
                  } catch {
                    console.error('Failed to parse dropped snippet IDs');
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
              >
                <VscTrash />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="h-full p-3 !text-text flex flex-col">
          <LocalSnippetCard
            style={{ alignSelf: 'center', marginBottom: '0.75rem', maxWidth: '450px', width: '100%' }}
            idx={editingLocalIdx}
            code={newCode}
            description={newDescription}
            language={newLanguage}
            title={newTitle}
            editSnippet={() => {}}
          />
          <hr className="border-border mb-3" />
          <h2 className="text-xl font-semibold mb-3">Edit Snippet</h2>
          <div className="flex gap-3 mb-3">
            <LanguageSelect language={newLanguage} setLanguage={setNewLangauge} omitOptionAll={true} />
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-3 rounded-sm bg-card border border-border pr-8 outline-none"
            />
          </div>
          <textarea
            placeholder="Title"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-3 rounded-sm bg-card border border-border pr-8 outline-none max-h-30 mb-3"
          />
          <textarea
            placeholder="Title"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-full p-3 rounded-sm bg-card border border-border pr-8 outline-none max-h-90 mb-3"
          />
          <div className="flex gap-3">
            <button
              className="px-3 py-1 border border-border rounded-sm cursor-pointer w-full max-w-30"
              onClick={() => {
                dispatch(
                  setLocalSnippet({
                    folderIdx,
                    snippetIdx: editingLocalIdx,
                    newSnippet: {
                      code: newCode,
                      description: newDescription,
                      kind: 'local',
                      language: newLanguage,
                      title: newTitle,
                    },
                  })
                );
                setEditingLocalIdx(-1);
              }}
            >
              Save
            </button>
            <button
              className="px-3 py-1 border border-border rounded-sm cursor-pointer w-full max-w-30"
              onClick={() => setEditingLocalIdx(-1)}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </SelectionProvider>
  );
};

export default FolderContainer;
