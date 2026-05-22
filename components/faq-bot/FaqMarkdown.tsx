'use client';

import { Fragment, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const escaped = escapeHtml(text);
  const parts: ReactNode[] = [];
  const pattern = /(`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(escaped)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Fragment key={key++}>{escaped.slice(lastIndex, match.index)}</Fragment>);
    }

    if (match[2] !== undefined) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.88em]"
        >
          {match[2]}
        </code>,
      );
    } else if (match[3] !== undefined) {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {match[3]}
        </strong>,
      );
    } else if (match[4] !== undefined) {
      parts.push(
        <em key={key++} className="italic">
          {match[4]}
        </em>,
      );
    } else if (match[5] !== undefined && match[6] !== undefined) {
      parts.push(
        <a
          key={key++}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline"
        >
          {match[5]}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < escaped.length) {
    parts.push(<Fragment key={key++}>{escaped.slice(lastIndex)}</Fragment>);
  }

  return parts.length ? parts : [text];
}

export interface FaqMarkdownProps {
  content: string;
  className?: string;
}

export function FaqMarkdown({ content, className }: FaqMarkdownProps) {
  const lines = content.split('\n');
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    if (line.trim() === '') {
      nodes.push(<div key={key++} className="h-1.5" aria-hidden="true" />);
      i++;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test((lines[i] ?? '').trim())) {
        codeLines.push(lines[i] ?? '');
        i++;
      }
      if (i < lines.length) i++;
      nodes.push(
        <pre
          key={key++}
          className="my-1 overflow-x-auto rounded-lg bg-white/[0.06] px-3 py-2.5 text-[0.85em]"
        >
          <code className="font-mono">{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      nodes.push(
        <p key={key++} className="mt-2 mb-0.5 text-[0.95rem] font-semibold leading-snug">
          {renderInlineMarkdown(line.replace(/^#{1,3}\s+/, ''))}
        </p>,
      );
      i++;
      continue;
    }

    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      nodes.push(
        <p key={key++} className="mt-2 mb-0.5 text-[0.95rem] font-semibold leading-snug">
          {renderInlineMarkdown(line.trim())}
        </p>,
      );
      i++;
      continue;
    }

    if (/^(\s*[-*])\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^(\s*[-*])\s+/.test(lines[i] ?? '')) {
        items.push(
          <li key={items.length} className="mb-0.5 leading-relaxed">
            {renderInlineMarkdown((lines[i] ?? '').replace(/^\s*[-*]\s+/, ''))}
          </li>,
        );
        i++;
      }
      nodes.push(
        <ul key={key++} className="my-0.5 list-disc space-y-0.5 pl-5">
          {items}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i] ?? '')) {
        items.push(
          <li key={items.length} className="mb-0.5 leading-relaxed">
            {renderInlineMarkdown((lines[i] ?? '').replace(/^\d+\.\s+/, ''))}
          </li>,
        );
        i++;
      }
      nodes.push(
        <ol key={key++} className="my-0.5 list-decimal space-y-0.5 pl-5">
          {items}
        </ol>,
      );
      continue;
    }

    nodes.push(
      <p key={key++} className="my-0.5 text-[0.95rem] leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>,
    );
    i++;
  }

  return <div className={cn('text-[0.95rem]', className)}>{nodes}</div>;
}
