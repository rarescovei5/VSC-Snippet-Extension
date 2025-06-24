import React from 'react';
import { useAppSelector } from '../app/hooks';
import { gridStyles, QueryContext } from './SnippetsLayout';
import { SnippetCard } from '../components/SnippetCard';
import { VscLoading, VscSearchStop } from 'react-icons/vsc';
import SelectionProvider from '../components/SelectionProvider';
import useDiscoverySnippets from '../hook/useDiscoverySnippets';

const SnippetsContainer = () => {
  const { selectedLanguage, titleQuery } = React.useContext(QueryContext);
  const pageSize = useAppSelector((state) => state.settings.apiConfig.pageSize);

  const { pages, currentPage, totalPages, isPending, loadNext } = useDiscoverySnippets(
    titleQuery,
    selectedLanguage,
    pageSize
  );

  return (
    <SelectionProvider>
      {/* Snippets  */}
      <div
        style={gridStyles}
        className="h-full grid gap-1 p-1 overflow-y-auto"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const isNearBottom = target.scrollTop >= target.scrollHeight - target.clientHeight - 25;
          if (isNearBottom) {
            loadNext();
          }
        }}
      >
        {pages.map((page, pIndex) => {
          return (
            <React.Fragment key={pIndex}>
              {page.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  language={snippet.language}
                  title={snippet.title}
                  tags={snippet.tags}
                  description={snippet.description ?? ''}
                  code={snippet.code ?? ''}
                  stars={snippet.stars}
                  snippetId={snippet.id}
                />
              ))}
            </React.Fragment>
          );
        })}
        {totalPages > 0 && (
          <span className="!text-text font-bold col-span-full my-2 text-center">{currentPage + '/' + totalPages}</span>
        )}
      </div>

      {/* Loading | Condition: Displays when user searches something else, or changes language filter */}
      {isPending && currentPage === 0 && (
        <VscLoading
          size={48}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !text-text animate-spin"
        />
      )}

      {/* Not Found | Condition: If no results prompt user to change filters */}
      {totalPages === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !text-text flex flex-col items-center text-center">
          <VscSearchStop size={48} className="mb-4" />
          <h1 className="text-2xl font-medium">No Snippets Found!</h1>
          <p className="text-text-muted mt-1 text-sm">Try adjusting your filters</p>
        </div>
      )}
    </SelectionProvider>
  );
};

export default SnippetsContainer;
