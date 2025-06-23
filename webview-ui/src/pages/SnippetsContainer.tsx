import React from 'react';
import type { Snippet } from '../types/types';
import { axiosInstance } from '../api';
import { useAppSelector } from '../app/hooks';
import { gridStyles, QueryContext } from './SnippetsLayout';
import { SnippetCard } from '../components/SnippetCard';
import { VscLoading, VscSearchStop } from 'react-icons/vsc';

const SnippetsContainer = () => {
  const { selectedLanguage, titleQuery } = React.useContext(QueryContext);

  const pageSize = useAppSelector((state) => state.settings.apiConfig.pageSize);

  const [pages, setPages] = React.useState<Snippet[][]>([]);

  const [currentPage, setCurrentPage] = React.useState(0);
  const [nextPage, setNextPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const debounceRef = React.useRef<number | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const fetchPage = React.useCallback(
    (page: number, replace: boolean) => async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedLanguage) queryParams.append('language', selectedLanguage);
        queryParams.append('title', titleQuery);
        queryParams.append('page', String(page));
        queryParams.append('limit', String(pageSize));

        const res = await axiosInstance.get(`/public/snippets?${queryParams.toString()}`);
        const data = res.data;

        setCurrentPage(data.current_page);
        setTotalPages(data.total_pages);

        setPages((old) => (replace ? [data.records] : [...old, data.records]));
      } catch (error) {
        console.error('Error fetching snippets', error);
      }
    },
    [selectedLanguage, titleQuery, pageSize]
  );

  React.useEffect(() => {
    setCurrentPage(0);
    setNextPage(1);
    setTotalPages(1);
  }, [titleQuery, selectedLanguage]);

  React.useEffect(() => {
    // Initial Load
    if (nextPage === 1) {
      debounceRef.current = window.setTimeout(() => {
        startTransition(fetchPage(1, true));
      }, 500);
      return () => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
      };
    }

    // Infinite scroll
    if (nextPage > 1) {
      startTransition(fetchPage(nextPage, false));
    }
  }, [nextPage, fetchPage]);

  return (
    <>
      {/* Snippets  */}
      <div
        style={gridStyles}
        className="h-full grid gap-1 p-1 overflow-y-auto"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const isNearBottom = target.scrollTop >= target.scrollHeight - target.clientHeight - 25;

          if (isNearBottom && currentPage < totalPages) {
            setNextPage(currentPage + 1);
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
    </>
  );
};

export default SnippetsContainer;
