import React from 'react';
import type { Snippet } from '../types/types';
import { axiosInstance } from '../api';

const useDiscoverySnippets = (titleQuery: string, selectedLanguage: string, pageSize: number) => {
  const [pages, setPages] = React.useState<Snippet[][]>([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [nextPage, setNextPage] = React.useState(1);
  const [isPending, startTransition] = React.useTransition();
  const debounceRef = React.useRef<number | null>(null);

  const fetchPage = React.useCallback(
    (page: number, replace: boolean) => async () => {
      const params = new URLSearchParams();
      if (selectedLanguage) params.append('language', selectedLanguage);
      params.append('title', titleQuery);
      params.append('page', String(page));
      params.append('limit', String(pageSize));

      const res = await axiosInstance.get<{
        current_page: number;
        total_pages: number;
        records: Snippet[];
      }>(`/public/snippets?${params.toString()}`);

      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.total_pages);
      setPages((old) => (replace ? [res.data.records] : [...old, res.data.records]));
    },
    [titleQuery, selectedLanguage, pageSize]
  );

  // reset when filters change
  React.useEffect(() => {
    setPages([]);
    setCurrentPage(0);
    setTotalPages(1);
    setNextPage(1);
  }, [titleQuery, selectedLanguage]);

  // initial load + infinite scroll trigger
  React.useEffect(() => {
    if (nextPage === 1) {
      debounceRef.current = window.setTimeout(() => {
        startTransition(fetchPage(1, true));
      }, 500);
      return () => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
      };
    }

    if (nextPage > 1 && nextPage <= totalPages) {
      startTransition(fetchPage(nextPage, false));
    }
  }, [nextPage, totalPages, fetchPage, startTransition]);

  const loadNext = React.useCallback(() => {
    if (currentPage < totalPages) {
      setNextPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  return {
    pages,
    currentPage,
    totalPages,
    isPending,
    loadNext,
  };
};

export default useDiscoverySnippets;
