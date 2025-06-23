import React from 'react';
import { useAppSelector } from '../app/hooks';
import LanguageSelect from '../components/LanguageSelect';
import TitleSearchbar from '../components/TitleSearchbar';
import { useParams } from '../ContextRouter/utilities/useParams';
import { gridStyles } from './SnippetsPage';
import type { Snippet } from '../types/types';
import { axiosInstance } from '../api';
import { SnippetCardCore } from '../components/SnippetCard';

const FolderPage = () => {
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

  const [titleQuery, setTitleQuery] = React.useState('');
  const [selectedLanguage, setSelectedLangauge] = React.useState('');

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar (search + filter) */}
      <header className="p-1 border-b border-border flex gap-4">
        <TitleSearchbar title={titleQuery} setTitle={setTitleQuery} />
        <LanguageSelect language={selectedLanguage} setLanguage={setSelectedLangauge} />
      </header>
      {/* Results Area */}
      <section className="min-h-0 flex-1 relative" aria-label="Snippet Results">
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
      </section>
    </div>
  );
};

export default FolderPage;
