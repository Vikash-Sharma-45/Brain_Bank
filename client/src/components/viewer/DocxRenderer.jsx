import React, { useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '../../lib/utils';

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function DocxRenderer({
  htmlContent = '',
  fontSize = 'base',
  fontFamily = 'serif',
  onHeadingsExtracted,
}) {
  // Sanitize on client and inject heading anchor IDs for TOC
  const { cleanHtml, headings } = useMemo(() => {
    if (!htmlContent) return { cleanHtml: '', headings: [] };

    // 1. Sanitize HTML
    const sanitized = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'em', 'u', 's', 'b', 'i',
        'ul', 'ol', 'li', 'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'img', 'a', 'span', 'br', 'hr', 'sub', 'sup',
      ],
      ALLOWED_ATTR: ['src', 'alt', 'title', 'href', 'target', 'colspan', 'rowspan'],
    });

    // 2. Parse DOM in memory to extract headings and add anchor IDs
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3');
    const extractedHeadings = [];

    headingElements.forEach((el, index) => {
      const text = el.textContent?.trim() || `Section ${index + 1}`;
      const id = slugify(text) || `sec-${index}`;
      el.setAttribute('id', id);
      el.classList.add('scroll-mt-24');

      const level = parseInt(el.tagName.replace('H', ''), 10);
      extractedHeadings.push({ level, text, id });
    });

    return {
      cleanHtml: doc.body.innerHTML,
      headings: extractedHeadings,
    };
  }, [htmlContent]);

  useEffect(() => {
    if (onHeadingsExtracted) {
      onHeadingsExtracted(headings);
    }
  }, [headings, onHeadingsExtracted]);

  const fontSizes = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  };

  return (
    <article
      className={cn(
        'max-w-none docx-rendered-content transition-all',
        fontSizes[fontSize] || fontSizes.base,
        fontFamily === 'serif' ? 'font-serif' : 'font-sans',
        '[&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-border/50',
        '[&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:pb-1.5 [&_h2]:border-b [&_h2]:border-border/40',
        '[&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2',
        '[&_p]:my-3.5 [&_p]:text-foreground/90',
        '[&_ul]:my-3 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:space-y-1.5',
        '[&_ol]:my-3 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1.5',
        '[&_blockquote]:my-4 [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:bg-brand-500/5 [&_blockquote]:py-2 [&_blockquote]:px-3 [&_blockquote]:rounded-r-xl [&_blockquote]:italic',
        '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-sm',
        '[&_th]:p-3 [&_th]:font-semibold [&_th]:border-b [&_th]:border-border [&_th]:bg-muted/70',
        '[&_td]:p-3 [&_td]:border-b [&_td]:border-border/50',
        '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-4',
        '[&_a]:text-brand-600 dark:[&_a]:text-brand-400 [&_a]:underline'
      )}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

export default DocxRenderer;
