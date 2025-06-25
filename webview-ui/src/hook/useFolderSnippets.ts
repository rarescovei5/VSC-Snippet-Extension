import React from 'react';
import { axiosInstance } from '../api';
import type { Prettify, RemoteSnippet } from '../types/types';
import type { Folder } from '../app/folders/foldersSlice';

export function useFolderSnippets(titleQuery: string, selectedLanguage: string, folderData: Folder) {
  // split refs
  const itemsWithIdx = React.useMemo(() => folderData.items.map((snip, idx) => ({ ...snip, idx })), [folderData.items]);
  const remoteRefs = React.useMemo(() => itemsWithIdx.filter((i) => i.kind === 'remote'), [itemsWithIdx]);
  const local = React.useMemo(() => itemsWithIdx.filter((i) => i.kind === 'local'), [itemsWithIdx]);

  // fetch remote details
  const [remote, setRemote] = React.useState<Prettify<RemoteSnippet & { idx: number }>[]>([]);
  const fetchRemote = React.useCallback(async () => {
    const ids = remoteRefs.map((r) => r.snippetId).join(',');
    const res = await axiosInstance.get<Omit<RemoteSnippet, 'kind'>[]>(`/public/snippets/batch?ids=${ids}`);
    const merged = res.data
      .map((s) => {
        const ref = remoteRefs.find((r) => r.snippetId === s.id);
        return ref ? { ...s, kind: 'remote' as const, idx: ref.idx } : null;
      })
      .filter((s) => s !== null);
    setRemote(merged);
  }, [remoteRefs]);

  React.useEffect(() => {
    fetchRemote().catch(console.error);
  }, [fetchRemote]);

  // filter fn
  const matches = React.useCallback(
    ({ title, language }: { title: string; language: string }) => {
      const okTitle = !titleQuery || title.toLowerCase().includes(titleQuery.toLowerCase());
      const okLang =
        !selectedLanguage || selectedLanguage === '' ? true : language.toLowerCase() === selectedLanguage.toLowerCase();
      return okTitle && okLang;
    },
    [titleQuery, selectedLanguage]
  );

  // apply filters
  const localFiltered = React.useMemo(() => local.filter(matches), [local, matches]);
  const remoteFiltered = React.useMemo(() => remote.filter(matches), [remote, matches]);

  return {
    isEmpty: folderData.items.length === 0,
    hasResults: localFiltered.length + remoteFiltered.length > 0,
    snippets: [...localFiltered, ...remoteFiltered].sort((a, b) => a.idx - b.idx),
  };
}
