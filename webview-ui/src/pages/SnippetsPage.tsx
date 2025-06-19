import React from 'react';
import { VscChevronDown, VscClose, VscLoading, VscSearch, VscSearchStop } from 'react-icons/vsc';
import { axiosInstance } from '../api';
import type { Snippet } from '../types/types';

interface LanguageSelectProps {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
}
const LanguageSelect = (props: LanguageSelectProps) => {
  return (
    <div className="!text-text">
      <button className="p-3 bg-card border border-border rounded-sm flex gap-2 items-center cursor-pointer">
        <span>{props.language}</span> <VscChevronDown />
      </button>
      <div className="hidden">
        <div data-value="c">C</div>
        <div data-value="cpp">C++</div>
        <div data-value="csharp">C#</div>
        <div data-value="css">CSS</div>
        <div data-value="go">Go</div>
        <div data-value="java">Java</div>
        <div data-value="javascript">JavaScript</div>
        <div data-value="json">JSON</div>
        <div data-value="kotlin">Kotlin</div>
        <div data-value="lua">Lua</div>
        <div data-value="php">PHP</div>
        <div data-value="powershell">PowerShell</div>
        <div data-value="python">Python</div>
        <div data-value="ruby">Ruby</div>
        <div data-value="rust">Rust</div>
        <div data-value="sql">SQL</div>
        <div data-value="swift">Swift</div>
        <div data-value="typescript">TypeScript</div>
        <div data-value="xml">XML</div>
      </div>
    </div>
  );
};

interface TitleSearchbarProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}
const TitleSearchbar = (props: TitleSearchbarProps) => {
  return (
    <div className="!text-text relative flex-1">
      <input
        className="w-full h-full p-3 rounded-sm bg-card border border-border pr-8 outline-none"
        type="text"
        placeholder="Search..."
        value={props.title}
        onChange={(e) => {
          props.setTitle(e.target.value);
        }}
      />
      {!props.title.length ? (
        <VscSearch size={16} className="absolute right-4 top-1/2 -translate-y-1/2" />
      ) : (
        <VscClose
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={() => props.setTitle('')}
        />
      )}
    </div>
  );
};

const SnippetsPage = () => {
  const [titleQuery, setTitleQuery] = React.useState('');
  const [selectedLanguage, setSelectedLangauge] = React.useState('All Languages');

  const [snippets, setSnippets] = React.useState<Snippet[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const debounceRef = React.useRef<number | null>(null);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      startTransition(async () => {
        const res = await axiosInstance.get(
          `/public/snippets?${
            selectedLanguage !== 'All Languages' ? `language=${selectedLanguage}&` : ''
          }title=${titleQuery}&page=${currentPage}&limit=10`
        );
        const data = res.data;
        setTotalPages(data.total_pages);
        setSnippets(data.records);
      });
    }, 250);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [selectedLanguage, titleQuery, currentPage]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-1 border-b border-border flex gap-4">
        <TitleSearchbar title={titleQuery} setTitle={setTitleQuery} />
        <LanguageSelect language={selectedLanguage} setLanguage={setSelectedLangauge} />
      </div>
      <div className="relative flex-1">
        {isPending ? (
          <VscLoading
            size={48}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !text-text animate-spin"
          />
        ) : totalPages === 0 ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !text-text flex flex-col items-center">
            <VscSearchStop size={48} className="mb-4" />
            <h1 className="text-2xl font-medium">No Snippets Found!</h1>
            <p className="text-text-muted mt-1 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <></>
        )}
        <span className="z-10 absolute right-4 bottom-4 !text-text font-bold">
          {isPending || totalPages === 0 ? '' : currentPage + '/' + totalPages}
        </span>
      </div>
    </div>
  );
};

export default SnippetsPage;
