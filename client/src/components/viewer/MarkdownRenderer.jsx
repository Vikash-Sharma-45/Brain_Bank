import React, { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import {
  BookOpen,
  Check,
  CircleHelp,
  FlaskConical,
  Info,
  Lightbulb,
  OctagonAlert,
  Pencil,
  Quote,
  ShieldAlert,
  Sigma,
  TriangleAlert,
  Copy,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import remarkCallouts from '../../lib/remarkCallouts';

const calloutStyles = [
  'note',
  'info',
  'tip',
  'warning',
  'danger',
  'example',
  'quote',
  'definition',
  'theorem',
  'important',
  'question',
];
const calloutClassNames = [
  'markdown-callout',
  'markdown-callout-title',
  'markdown-callout-body',
  ...calloutStyles.flatMap((type) => [`callout-${type}`, `callout-title-${type}`]),
];

const attributesWithCalloutClasses = (tagName) => [
  ...(defaultSchema.attributes[tagName] || []),
  ['className', ...calloutClassNames],
];

const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes.code || []),
      ['className', 'math-inline', 'math-display'],
    ],
    div: attributesWithCalloutClasses('div'),
    details: attributesWithCalloutClasses('details'),
    summary: attributesWithCalloutClasses('summary'),
  },
};

const calloutIcons = {
  note: Pencil,
  info: Info,
  tip: Lightbulb,
  warning: TriangleAlert,
  danger: OctagonAlert,
  example: FlaskConical,
  quote: Quote,
  definition: BookOpen,
  theorem: Sigma,
  important: ShieldAlert,
  question: CircleHelp,
};

function CalloutTitle({ className, children, as: Element = 'div' }) {
  const type = className?.match(/callout-title-([a-z]+)/)?.[1] || 'note';
  const Icon = calloutIcons[type] || Pencil;

  return (
    <Element className={className}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </Element>
  );
}

function MarkdownDiv({ className, children }) {
  if (className?.split(/\s+/).includes('markdown-callout-title')) {
    return (
      <CalloutTitle className={className}>
        {children}
      </CalloutTitle>
    );
  }

  return <div className={className}>{children}</div>;
}

function MarkdownSummary({ className, children }) {
  return (
    <CalloutTitle as="summary" className={className}>
      {children}
    </CalloutTitle>
  );
}

// Slugify string for heading anchor IDs
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Code block with copy button
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const textContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-border bg-muted/60 dark:bg-black/30">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-border/50 text-[11px] font-mono text-muted-foreground bg-surface/50">
        <span>{className?.replace('language-', '') || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-foreground transition-colors p-1 rounded"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({
  content = '',
  fontSize = 'base',
  fontFamily = 'sans',
  onHeadingsExtracted,
}) {
  // Extract headings for Table of Contents
  useEffect(() => {
    if (!onHeadingsExtracted) return;

    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const extracted = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // Remove markdown links or bold from heading title
      const cleanText = rawText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_~`]/g, '');
      const id = slugify(cleanText);

      extracted.push({ level, text: cleanText, id });
    }

    onHeadingsExtracted(extracted);
  }, [content, onHeadingsExtracted]);

  // Reader font size is applied only to the article so KaTeX can size its children.
  const fontSizes = {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  };
  const lineHeights = {
    sm: 'leading-relaxed',
    base: 'leading-relaxed',
    lg: 'leading-loose',
    xl: 'leading-loose',
  };

  const components = useMemo(
    () => ({
      h1: ({ children }) => {
        const id = slugify(String(children));
        return (
          <h1
            id={id}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-8 mb-4 pt-4 border-b border-border/50 text-foreground scroll-mt-24"
          >
            {children}
          </h1>
        );
      },
      h2: ({ children }) => {
        const id = slugify(String(children));
        return (
          <h2
            id={id}
            className="text-xl sm:text-2xl font-bold tracking-tight mt-7 mb-3 pt-3 border-b border-border/40 text-foreground scroll-mt-24"
          >
            {children}
          </h2>
        );
      },
      h3: ({ children }) => {
        const id = slugify(String(children));
        return (
          <h3
            id={id}
            className="text-lg sm:text-xl font-semibold tracking-tight mt-5 mb-2 text-foreground scroll-mt-24"
          >
            {children}
          </h3>
        );
      },
      p: ({ children }) => <p className="my-3.5 text-foreground/90">{children}</p>,
      ul: ({ children }) => <ul className="my-3 pl-6 list-disc space-y-1.5">{children}</ul>,
      ol: ({ children }) => <ol className="my-3 pl-6 list-decimal space-y-1.5">{children}</ol>,
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      blockquote: ({ children }) => (
        <blockquote className="my-4 pl-4 border-l-4 border-brand-500 bg-brand-500/5 py-2 px-3 rounded-r-xl italic text-muted-foreground">
          {children}
        </blockquote>
      ),
      div: MarkdownDiv,
      details: ({ className, open, children }) => (
        <details className={className} open={open}>
          {children}
        </details>
      ),
      summary: MarkdownSummary,
      table: ({ children }) => (
        <div className="my-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-left text-sm">{children}</table>
        </div>
      ),
      thead: ({ children }) => <thead className="bg-muted/70">{children}</thead>,
      th: ({ children }) => (
        <th className="p-3 font-semibold text-foreground border-b border-border">{children}</th>
      ),
      td: ({ children }) => (
        <td className="p-3 border-b border-border/50 text-foreground/90">{children}</td>
      ),
      code: ({ inline, className, children }) => {
        if (inline) {
          return (
            <code className="px-1.5 py-0.5 rounded-md bg-muted text-brand-600 dark:text-brand-400 font-mono text-[0.9em] border border-border/50">
              {children}
            </code>
          );
        }
        return <CodeBlock className={className}>{children}</CodeBlock>;
      },
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 dark:text-brand-400 font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          {children}
        </a>
      ),
      hr: () => <hr className="my-8 border-border/60" />,
    }),
    []
  );

  return (
    <article
      className={cn(
        'markdown-content max-w-none transition-all',
        lineHeights[fontSize] || lineHeights.base,
        fontFamily === 'serif' ? 'font-serif' : 'font-sans'
      )}
      style={{ fontSize: fontSizes[fontSize] || fontSizes.base }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkCallouts]}
        rehypePlugins={[
          [rehypeSanitize, markdownSanitizeSchema],
          [rehypeKatex, { throwOnError: false, errorColor: '#cc0000' }],
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

export default MarkdownRenderer;
