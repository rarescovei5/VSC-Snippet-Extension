import React from 'react';
import { axiosInstance } from '../api';
import { useAppSelector } from '../app/hooks';
import { useParams } from '../ContextRouter/utilities/useParams';
import type { Snippet } from '../types/types';
import { SnippetCardCore } from '../components/SnippetCard';
import { gridStyles } from './SnippetsLayout';

const FolderContainer = () => {
  const folderId = Number(useParams().folderId);
  const folderData = useAppSelector((state) => state.folders)[folderId];

  const remoteSnippetIds = React.useMemo(() => folderData.items.filter((snip) => snip.kind === 'remote'), [folderData]);

  const [remoteSnippets, setRemoteSnippets] = React.useState<Snippet[]>([]);
  const localSnippets = React.useMemo(() => folderData.items.filter((snip) => snip.kind === 'local'), [folderData]);

  const fetchRemoteSnippets = React.useCallback(async () => {
    const res = await axiosInstance.get(`/public/snippets/batch?ids=${remoteSnippetIds}`);
    setRemoteSnippets(res.data);
  }, [remoteSnippetIds]);

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
        {localSnippets.map((snippet, idx) => (
          <SnippetCardCore
            key={idx}
            code={snippet.code ?? ''}
            description={snippet.description ?? ''}
            language={snippet.language}
            title={snippet.title}
          />
        ))}
        {remoteSnippets.map((snippet, idx) => (
          <SnippetCardCore
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
