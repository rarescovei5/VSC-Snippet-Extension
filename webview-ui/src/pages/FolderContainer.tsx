import React from 'react';
import { axiosInstance } from '../api';
import { useAppSelector } from '../app/hooks';
import { useParams } from '../ContextRouter/utilities/useParams';
import type { Prettify, Snippet } from '../types/types';
import { LocalSnippetCard, RemoteSnippetCard } from '../components/SnippetCard';
import { gridStyles, QueryContext } from './SnippetsLayout';

const FolderContainer = () => {
  const { selectedLanguage, titleQuery } = React.useContext(QueryContext);

  // Filtering logic
  const matchesFilter = React.useCallback(
    (title: string, language: string) => {
      const matchesTitle = titleQuery ? title.toLowerCase().includes(titleQuery.toLowerCase()) : true;
      const matchesLang =
        selectedLanguage && selectedLanguage !== 'all'
          ? language.toLowerCase() === selectedLanguage.toLowerCase()
          : true;
      return matchesTitle && matchesLang;
    },
    [titleQuery, selectedLanguage]
  );

  const folderId = Number(useParams().folderId);
  const folderData = useAppSelector((state) => state.folders)[folderId];

  const remoteSnippetRefs = React.useMemo(
    () => folderData.items.map((snip, idx) => ({ ...snip, idx })).filter((snip) => snip.kind === 'remote'),
    [folderData]
  );

  const [remoteSnippets, setRemoteSnippets] = React.useState<
    Prettify<Omit<Snippet, 'id' | 'tags' | 'stars'> & { idx: number }>[]
  >([]);

  const localSnippets = React.useMemo(
    () => folderData.items.map((snip, idx) => ({ ...snip, idx })).filter((snip) => snip.kind === 'local'),
    [folderData]
  );

  const fetchRemoteSnippets = React.useCallback(async () => {
    const ids = remoteSnippetRefs.map((snip) => snip.snippetId);
    const res = await axiosInstance.get<Snippet[]>(`/public/snippets/batch?ids=${ids}`);
    const data = res.data;
    const snippetsWithIdx: Prettify<Snippet & { idx: number }>[] = data
      .map((snip) => {
        const ref = remoteSnippetRefs.find((r) => r.snippetId === snip.id);
        if (!ref) return null;
        return { ...snip, idx: ref.idx };
      })
      .filter((s) => s !== null);

    setRemoteSnippets(snippetsWithIdx);
  }, [remoteSnippetRefs]);

  React.useEffect(() => {
    try {
      fetchRemoteSnippets();
    } catch (err) {
      console.error('Encountered error while fetching snippets: ', err);
    }
  }, [fetchRemoteSnippets]);

  return (
    <>
      {/* Snippets  */}
      <div style={gridStyles} className="h-full grid gap-1 p-1 overflow-y-auto">
        {localSnippets
          .filter((snip) => matchesFilter(snip.title, snip.language))
          .map((snippet, idx) => (
            <LocalSnippetCard
              key={idx}
              code={snippet.code ?? ''}
              description={snippet.description ?? ''}
              language={snippet.language}
              title={snippet.title}
            />
          ))}
        {remoteSnippets
          .filter((snip) => matchesFilter(snip.title, snip.language))
          .map((snippet, idx) => (
            <RemoteSnippetCard
              key={idx}
              code={snippet.code ?? ''}
              description={snippet.description ?? ''}
              language={snippet.language}
              title={snippet.title}
            />
          ))}
      </div>
    </>
  );
};

export default FolderContainer;
