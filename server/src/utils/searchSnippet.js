const stripMarkdownForSnippet = (content) =>
  content
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$(?:\\.|[^$\\])*\$/g, ' ')
    .replace(/^\s{0,3}>\s*\[![a-z][\w-]*[+-]?\]\s*/gim, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .trim();

export function createSearchSnippet(source, query) {
  const text = stripMarkdownForSnippet(source);
  if (!text) return '';

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  for (const term of terms) {
    const index = text.toLowerCase().indexOf(term);
    if (index === -1) continue;

    const start = Math.max(0, index - 80);
    const end = Math.min(text.length, index + term.length + 80);
    return `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`;
  }

  return `${text.slice(0, 160)}${text.length > 160 ? '...' : ''}`;
}
