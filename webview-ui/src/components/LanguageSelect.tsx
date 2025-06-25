import React from 'react';
import { VscChevronDown } from 'react-icons/vsc';

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
  omitOptionAll?: boolean;
}
const LanguageSelect = ({ language, setLanguage, omitOptionAll = false }: LanguageSelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const displayed = React.useMemo(() => {
    const match = languageOptions.find(([value]) => value === language);
    return match ? match[1] : 'Unknown';
  }, [language]);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = (e.target as HTMLElement).closest<HTMLDivElement>('[data-value]');
    if (!el) return;
    setLanguage(el.dataset.value!);

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
          {languageOptions.slice(omitOptionAll ? 1 : 0).map(([value, label]) => (
            <div
              onClick={handleClick}
              key={value || 'all'}
              data-value={value}
              className={`cursor-pointer px-3 py-1 ${language === value ? 'bg-text/20' : 'hover:bg-text/10'}`}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelect;
