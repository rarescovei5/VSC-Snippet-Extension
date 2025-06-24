import React from 'react';
import { LocalSnippetCard } from '../components/SnippetCard';
import { gridStyles, QueryContext } from './SnippetsLayout';
import { VscFiles, VscSearchStop } from 'react-icons/vsc';
import SelectionProvider from '../components/SelectionProvider';
import { useFolderSnippets } from '../hook/useFolderSnippets';
import { EmptyState } from '../components/EmptyState';

const FolderContainer = () => {
  const { selectedLanguage, titleQuery } = React.useContext(QueryContext);
  const { isEmpty, hasResults, snippets } = useFolderSnippets(titleQuery, selectedLanguage);

  return (
    <SelectionProvider>
      {/* Snippets  */}
      <div style={gridStyles} className="h-full grid gap-1 p-1 overflow-y-auto">
        {snippets.map((snippet, idx) => (
          <LocalSnippetCard
            key={idx}
            code={snippet.code ?? ''}
            description={snippet.description ?? ''}
            language={snippet.language}
            title={snippet.title}
          />
        ))}

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
    </SelectionProvider>
  );
};

export default FolderContainer;
