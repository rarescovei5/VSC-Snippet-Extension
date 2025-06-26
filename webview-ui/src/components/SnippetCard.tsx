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
import type { Uuid } from '../types/types';
import { SelectionContext } from './SelectionProvider';
import { useParams } from '../ContextRouter/utilities/useParams';

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

interface SnippetCardProps {
  title: string;
  description: string;
  language: string;
  code: string;
  stars: number;
  tags: Array<string>;
  snippetId: Uuid;
}

export const SnippetCard = (props: SnippetCardProps) => {
  // Appearance
  const { showLineNumbers } = useAppSelector((state) => state.settings.appearance);
  const LangIcon = iconMap[props.language.toLowerCase()] || LuFileCode;

  // Selection
  const selectionCtx = React.useContext(SelectionContext);
  const isSelected = selectionCtx.selected.has(props.snippetId);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const allIds = Array.from(selectionCtx.selected);
    const total = allIds.length;

    const host = document.getElementById('drag-preview-container')!;
    host.querySelector('span')!.innerText = `${total}`;

    e.dataTransfer.setDragImage(host, 5, 5);

    e.dataTransfer.setData(
      'application/x-folder-snippets',
      JSON.stringify(allIds.map((id) => ({ kind: 'remote', snippetId: id })))
    );
  };
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    selectionCtx.setSelected(new Set());
  };

  return (
    <div
      onClick={(e) => {
        if (!e.shiftKey) return;
        selectionCtx.setSelected((prev) => {
          const newSet = new Set(prev);
          if (!newSet.has(props.snippetId)) {
            newSet.add(props.snippetId);
          } else {
            newSet.delete(props.snippetId);
          }
          return newSet;
        });
      }}
      draggable={isSelected}
      onDragStart={isSelected ? handleDragStart : () => {}}
      onDragEnd={isSelected ? handleDragEnd : () => {}}
      className={`group bg-card p-3 flex flex-col justify-between gap-4 rounded-sm border border-border ring ${
        isSelected ? 'ring-text' : 'ring-transparent'
      }`}
    >
      {/* Header  */}
      <div className="flex flex-col !text-text gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LangIcon />
            <h3 className="text-base">{props.title}</h3>
          </div>
          <div
            className={`rounded-sm items-center justify-center border cursor-pointer border-text/50 w-4 h-4 ${
              isSelected ? 'flex' : 'hidden group-hover:flex'
            }`}
            onClick={() => {
              selectionCtx.setSelected((prev) => {
                const newSet = new Set(prev);
                if (!newSet.has(props.snippetId)) {
                  newSet.add(props.snippetId);
                } else {
                  newSet.delete(props.snippetId);
                }
                return newSet;
              });
            }}
          >
            {isSelected && <div className="bg-text/50 w-3 h-3 rounded-xs" />}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {props.tags.map((tag, index) => (
            <span key={index} className="bg-border px-2 bg rounded-sm">
              {tag}
            </span>
          ))}
        </div>
        <p>{props.description}</p>
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
          onClick={(e) => {
            e.stopPropagation();
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

interface RemoteSnippetCardProps {
  idx: number;
  title: string;
  description: string | null;
  language: string;
  code: string;
}
export const RemoteSnippetCard = (props: RemoteSnippetCardProps) => {
  const { showLineNumbers } = useAppSelector((state) => state.settings.appearance);

  const LangIcon = iconMap[props.language.toLowerCase()] || LuFileCode;

  const selectionCtx = React.useContext(SelectionContext);
  const isSelected = selectionCtx.selected.has(props.idx);

  const folderId = Number(useParams().folderId);
  const folderData = useAppSelector((s) => s.folders[folderId]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const allIdx = Array.from(selectionCtx.selected) as number[];
    const total = allIdx.length;

    const host = document.getElementById('drag-preview-container')!;
    host.querySelector('span')!.innerText = `${total}`;

    e.dataTransfer.setDragImage(host, 5, 5);

    e.dataTransfer.setData('application/x-folder-snippets', JSON.stringify(allIdx.map((idx) => folderData.items[idx])));
    e.dataTransfer.setData('application/x-deleted-snippets', JSON.stringify(allIdx));
  };
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    selectionCtx.setSelected(new Set());
  };

  return (
    <div
      onClick={(e) => {
        if (!e.shiftKey) return;
        selectionCtx.setSelected((prev) => {
          const newSet = new Set(prev);
          if (!newSet.has(props.idx)) {
            newSet.add(props.idx);
          } else {
            newSet.delete(props.idx);
          }
          return newSet;
        });
      }}
      draggable={isSelected}
      onDragStart={isSelected ? handleDragStart : () => {}}
      onDragEnd={isSelected ? handleDragEnd : () => {}}
      className={`group bg-card p-3 flex flex-col justify-between gap-4 rounded-sm border border-border ring ${
        isSelected ? 'ring-text' : 'ring-transparent'
      }`}
    >
      {/* Header  */}
      <div className="flex flex-col !text-text gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LangIcon />
            <h3 className="text-base">{props.title}</h3>
          </div>
          <div
            className={`rounded-sm items-center justify-center border cursor-pointer border-text/50 w-4 h-4 ${
              isSelected ? 'flex' : 'hidden group-hover:flex'
            }`}
            onClick={() => {
              selectionCtx.setSelected((prev) => {
                const newSet = new Set(prev);
                if (!newSet.has(props.idx)) {
                  newSet.add(props.idx);
                } else {
                  newSet.delete(props.idx);
                }
                return newSet;
              });
            }}
          >
            {isSelected && <div className="bg-text/50 w-3 h-3 rounded-xs" />}
          </div>
        </div>
        <p>{props.description}</p>
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
      <div className="flex !text-text">
        <button
          onClick={() => {
            navigator.clipboard.writeText(props.code);
          }}
          className="px-3 py-1 border border-border rounded-sm cursor-pointer"
        >
          Copy
        </button>
      </div>
    </div>
  );
};

type LocalSnippetCardProps = {
  idx: number;
  title: string;
  description: string | null;
  language: string;
  code: string;
  editSnippet: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const LocalSnippetCard = (props: LocalSnippetCardProps) => {
  const { showLineNumbers } = useAppSelector((state) => state.settings.appearance);

  const LangIcon = iconMap[props.language.toLowerCase()] || LuFileCode;

  const selectionCtx = React.useContext(SelectionContext);
  const isSelected = selectionCtx.selected.has(props.idx);

  const folderId = Number(useParams().folderId);
  const folderData = useAppSelector((s) => s.folders[folderId]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const allIdx = Array.from(selectionCtx.selected) as number[];
    const total = allIdx.length;

    const host = document.getElementById('drag-preview-container')!;
    host.querySelector('span')!.innerText = `${total}`;

    e.dataTransfer.setDragImage(host, 5, 5);

    e.dataTransfer.setData('application/x-folder-snippets', JSON.stringify(allIdx.map((idx) => folderData.items[idx])));
    e.dataTransfer.setData('application/x-deleted-snippets', JSON.stringify(allIdx));
  };
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    selectionCtx.setSelected(new Set());
  };

  return (
    <div
      style={props.style}
      onClick={(e) => {
        if (!e.shiftKey) return;
        selectionCtx.setSelected((prev) => {
          const newSet = new Set(prev);
          if (!newSet.has(props.idx)) {
            newSet.add(props.idx);
          } else {
            newSet.delete(props.idx);
          }
          return newSet;
        });
      }}
      draggable={isSelected}
      onDragStart={isSelected ? handleDragStart : () => {}}
      onDragEnd={isSelected ? handleDragEnd : () => {}}
      className={`group bg-card p-3 flex flex-col justify-between gap-4 rounded-sm border border-border ring ${
        isSelected ? 'ring-text' : 'ring-transparent'
      }`}
    >
      {/* Header  */}
      <div className="flex flex-col !text-text gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LangIcon />
            <h3 className="text-base">{props.title}</h3>
          </div>
          <div
            className={`rounded-sm items-center justify-center border cursor-pointer border-text/50 w-4 h-4 ${
              isSelected ? 'flex' : 'hidden group-hover:flex'
            }`}
            onClick={() => {
              selectionCtx.setSelected((prev) => {
                const newSet = new Set(prev);
                if (!newSet.has(props.idx)) {
                  newSet.add(props.idx);
                } else {
                  newSet.delete(props.idx);
                }
                return newSet;
              });
            }}
          >
            {isSelected && <div className="bg-text/50 w-3 h-3 rounded-xs" />}
          </div>
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
      <div className="flex !text-text gap-3">
        <button
          onClick={() => {
            navigator.clipboard.writeText(props.code);
          }}
          className="px-3 py-1 border border-border rounded-sm cursor-pointer"
        >
          Copy
        </button>
        <button
          onClick={() => {
            props.editSnippet();
          }}
          className="px-3 py-1 border border-border rounded-sm cursor-pointer"
        >
          Edit
        </button>
      </div>
    </div>
  );
};
