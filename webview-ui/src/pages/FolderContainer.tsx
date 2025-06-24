import React from 'react';
import { LocalSnippetCard, RemoteSnippetCard } from '../components/SnippetCard';
import { gridStyles, QueryContext } from './SnippetsLayout';
import { VscFiles, VscSearchStop, VscTrash } from 'react-icons/vsc';
import SelectionProvider from '../components/SelectionProvider';
import { useFolderSnippets } from '../hook/useFolderSnippets';
import { EmptyState } from '../components/EmptyState';
import { useAppDispatch } from '../app/hooks';
import { useParams } from '../ContextRouter/utilities/useParams';
import { deleteSnippets } from '../app/folders/foldersSlice';

const FolderContainer = () => {
  const dispatch = useAppDispatch();
  const folderIdx = Number(useParams().folderId);

  const { selectedLanguage, titleQuery } = React.useContext(QueryContext);
  const { isEmpty, hasResults, snippets } = useFolderSnippets(titleQuery, selectedLanguage);

  return (
    <SelectionProvider>
      {/* Snippets  */}
      <div style={gridStyles} className="h-full grid gap-1 p-1 overflow-y-auto">
        {snippets.map((snip) =>
          snip.kind === 'local' ? (
            <LocalSnippetCard
              key={snip.idx}
              idx={snip.idx}
              code={snip.code ?? ''}
              description={snip.description}
              language={snip.language}
              title={snip.title}
            />
          ) : (
            <RemoteSnippetCard
              key={snip.idx}
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
      {!isEmpty && (
        <div
          className="z-10 bg-card border border-border p-3 absolute right-3 bottom-3 rounded-sm !text-text"
          onDrop={(e) => {
            e.preventDefault();
            const json = e.dataTransfer.getData('application/x-deleted-snippets');
            if (!json) return;

            console.log(json);

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
    </SelectionProvider>
  );
};

export default FolderContainer;
