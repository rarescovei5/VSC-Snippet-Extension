import React from 'react';
import { FaCss3, FaJava } from 'react-icons/fa';
import { LuFileCode, LuFileJson } from 'react-icons/lu';
import {
  SiC,
  SiCplusplus,
  SiGo,
  SiJavascript,
  SiKotlin,
  SiLua,
  SiMysql,
  SiPhp,
  SiPython,
  SiRuby,
  SiRust,
  SiSwift,
  SiTypescript,
  SiXml,
} from 'react-icons/si';
import { TbBrandCSharp } from 'react-icons/tb';
import { VscStarFull } from 'react-icons/vsc';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useAppSelector } from '../app/hooks';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  c: SiC,
  cpp: SiCplusplus,
  csharp: TbBrandCSharp,
  css: FaCss3,
  go: SiGo,
  java: FaJava,
  javascript: SiJavascript,
  json: LuFileJson,
  kotlin: SiKotlin,
  lua: SiLua,
  php: SiPhp,
  python: SiPython,
  ruby: SiRuby,
  rust: SiRust,
  sql: SiMysql,
  swift: SiSwift,
  typescript: SiTypescript,
  xml: SiXml,
};

type SnippetCardCoreProps = {
  title: string;
  description: string;
  language: string;
  code: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const SnippetCardCore = (props: SnippetCardCoreProps) => {
  const { title, description, language, code, ...divProps } = props;
  const { showLineNumbers } = useAppSelector((state) => state.settings.appearance);

  const LangIcon = iconMap[language.toLowerCase()] || LuFileCode;

  return (
    <div className="bg-card p-3 flex flex-col justify-between gap-4 rounded-sm border border-border" {...divProps}>
      {/* Header  */}
      <div className="flex flex-col !text-text gap-2">
        <div className="flex items-center gap-2">
          <LangIcon />
          <h3 className="text-base">{title}</h3>
        </div>
        <p className="!text-text">{description}</p>
      </div>

      {/* Content */}
      <SyntaxHighlighter
        language={language}
        customStyle={{
          fontSize: '0.9rem',
          fontFamily: 'Fira Code, Consolas, Menlo, monospace',
          margin: 0,
          padding: '0.75rem',
          background: 'var(--vscode-panel-border)',
          borderRadius: '0.25rem',
          maxHeight: '250px',
        }}
        showLineNumbers={showLineNumbers}
        style={atomOneDark}
      >
        {code}
      </SyntaxHighlighter>

      {/* Footer  */}
      <div className="flex justify-between !text-text">
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
          }}
          className="px-3 py-1 border border-border rounded-sm cursor-pointer"
        >
          Copy
        </button>
      </div>
    </div>
  );
};

interface SnippetCardProps {
  title: string;
  description: string;
  language: string;
  code: string;
  stars: number;
  tags: Array<string>;
}

export const SnippetCard = (props: SnippetCardProps) => {
  const { showLineNumbers } = useAppSelector((state) => state.settings.appearance);

  const LangIcon = iconMap[props.language.toLowerCase()] || LuFileCode;

  return (
    <div className="bg-card p-3 flex flex-col justify-between gap-4 rounded-sm border border-border">
      {/* Header  */}
      <div className="flex flex-col !text-text gap-2">
        <div className="flex items-center gap-2">
          <LangIcon />
          <h3 className="text-base">{props.title}</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {props.tags.map((tag, index) => (
            <span key={index} className="bg-border px-2 bg rounded-sm">
              {tag}
            </span>
          ))}
        </div>
        <p className="!text-text">{props.description}</p>
      </div>

      {/* Content */}
      <SyntaxHighlighter
        language={props.language}
        customStyle={{
          fontSize: '0.9rem',
          fontFamily: 'Fira Code, Consolas, Menlo, monospace',
          margin: 0,
          padding: '0.75rem',
          background: 'var(--vscode-panel-border)',
          borderRadius: '0.25rem',
          maxHeight: '250px',
        }}
        showLineNumbers={showLineNumbers}
        style={atomOneDark}
      >
        {props.code}
      </SyntaxHighlighter>

      {/* Footer  */}
      <div className="flex justify-between !text-text">
        <button
          onClick={() => {
            navigator.clipboard.writeText(props.code);
          }}
          className="px-3 py-1 border border-border rounded-sm cursor-pointer"
        >
          Copy
        </button>
        <div className="flex items-center gap-1">
          <span>{props.stars}</span>
          <VscStarFull />
        </div>
      </div>
    </div>
  );
};
