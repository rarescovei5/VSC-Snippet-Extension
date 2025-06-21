import React from 'react';
import { VscChevronDown, VscClose, VscLoading, VscSearch, VscSearchStop } from 'react-icons/vsc';
import { axiosInstance } from '../api';
import type { Snippet } from '../types/types';
import SnippetCard from '../components/SnippetCard';

const languageOptions = [
  ['', 'All Languages'],
  ['c', 'C'],
  ['cpp', 'C++'],
  ['csharp', 'C#'],
  ['css', 'CSS'],
  ['go', 'Go'],
  ['java', 'Java'],
  ['javascript', 'JavaScript'],
  ['json', 'JSON'],
  ['kotlin', 'Kotlin'],
  ['lua', 'Lua'],
  ['php', 'PHP'],
  ['python', 'Python'],
  ['ruby', 'Ruby'],
  ['rust', 'Rust'],
  ['sql', 'SQL'],
  ['swift', 'Swift'],
  ['typescript', 'TypeScript'],
  ['xml', 'XML'],
];
interface LanguageSelectProps {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
}
const LanguageSelect = (props: LanguageSelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const [displayed, setDisplayed] = React.useState('All Languages');

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // look for the nearest child DIV that carries your data‑value
    const el = (e.target as HTMLElement).closest<HTMLDivElement>('[data-value]');
    if (!el) return;
    props.setLanguage(el.dataset.value!);
    setDisplayed((e.target as HTMLElement).innerText);
    setIsOpen(false);
  };

  return (
    <div className="!text-text relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-3 min-w-50 bg-card border border-border rounded-sm flex gap-2 items-center cursor-pointer"
      >
        <span className="flex-1 text-left">{displayed}</span> <VscChevronDown />
      </button>
      {isOpen && (
        <div className="z-10 absolute w-full right-0 top-[110%] bg-card border border-border rounded-sm flex flex-col">
          {languageOptions.map(([value, label]) => (
            <div
              onClick={handleClick}
              key={value || 'all'}
              data-value={value}
              className={`cursor-pointer px-3 py-1 ${props.language === value ? 'bg-text/20' : 'hover:bg-text/10'}`}
            >
              {label}
            </div>
          ))}
        </div>
      )}
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
  const [selectedLanguage, setSelectedLangauge] = React.useState('');

  const [snippets, setSnippets] = React.useState<Snippet[][]>([]);
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
            selectedLanguage !== '' ? `language=${selectedLanguage}&` : ''
          }title=${titleQuery}&page=${currentPage}&limit=10`
        );
        const data = res.data;
        setTotalPages(data.total_pages);
        if (currentPage === 1) {
          setSnippets([data.records]);
        } else {
          setSnippets((prev) => {
            let prevCopy = prev;
            prevCopy.push(data.records);
            return prevCopy;
          });
        }
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
      {/* Toolbar (search + filter) */}
      <header className="p-1 border-b border-border flex gap-4">
        <TitleSearchbar title={titleQuery} setTitle={setTitleQuery} />
        <LanguageSelect language={selectedLanguage} setLanguage={setSelectedLangauge} />
      </header>

      {/* Results Area */}
      {isPending ? (
        <section className="flex-1 relative">
          <VscLoading
            size={48}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !text-text animate-spin"
          />
        </section>
      ) : totalPages === 0 ? (
        <section className="flex-1 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !text-text flex flex-col items-center text-center">
            <VscSearchStop size={48} className="mb-4" />
            <h1 className="text-2xl font-medium">No Snippets Found!</h1>
            <p className="text-text-muted mt-1 text-sm">Try adjusting your filters</p>
          </div>
        </section>
      ) : (
        <section
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gridAutoRows: 'max-content',
          }}
          className="flex-1 grid gap-1 p-1 overflow-y-auto"
        >
          {snippets.map((snippetsPage) => {
            return snippetsPage.map((snippet) => {
              return (
                <SnippetCard
                  key={snippet.id}
                  language={snippet.language}
                  title={snippet.title}
                  tags={snippet.tags}
                  description={snippet.description ?? ''}
                  code={snippet.code ?? ''}
                  stars={snippet.stars}
                />
              );
            });
          })}
          <span className="!text-text font-bold col-span-full my-2 text-center">{currentPage + '/' + totalPages}</span>
        </section>
      )}
    </div>
  );
};

export default SnippetsPage;
