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

export default LanguageSelect;
