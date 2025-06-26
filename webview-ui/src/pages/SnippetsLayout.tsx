import React from 'react';
import LanguageSelect from '../components/LanguageSelect';
import TitleSearchbar from '../components/TitleSearchbar';
import { Outlet } from '../ContextRouter';

export const gridStyles = {
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gridAutoRows: 'max-content',
};

interface QueryContextType {
  selectedLanguage: string;
  titleQuery: string;
}

const initialContextType: QueryContextType = {
  titleQuery: '',
  selectedLanguage: '',
};

export const QueryContext = React.createContext<QueryContextType>(initialContextType);

const SnippetsLayout = () => {
  const [titleQuery, setTitleQuery] = React.useState('');
  const [selectedLanguage, setSelectedLangauge] = React.useState('');

  const value = React.useMemo(() => ({ titleQuery, selectedLanguage }), [titleQuery, selectedLanguage]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar (search + filter) */}
      <header className="p-1 border-b border-border flex gap-4">
        <TitleSearchbar title={titleQuery} setTitle={setTitleQuery} />
        <LanguageSelect language={selectedLanguage} setLanguage={setSelectedLangauge} />
      </header>

      {/* Results Area */}
      <section className="min-h-0 flex-1 relative" aria-label="Snippet Results">
        <QueryContext value={value}>
          <Outlet />
        </QueryContext>
      </section>
    </div>
  );
};

export default SnippetsLayout;
