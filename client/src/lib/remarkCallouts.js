const CALLOUT_TYPES = new Set([
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
]);

const markerPattern = /^\[!([a-z][a-z0-9_-]*)([+-])?\]([+-])?\s*/i;

function plainText(nodes) {
  return nodes
    .map((node) => {
      if (node.type === 'text' || node.type === 'inlineCode') return node.value || '';
      if (node.type === 'break') return ' ';
      if (node.children) return plainText(node.children);
      return node.alt || '';
    })
    .join('');
}

function calloutElement(type, hName, classNames, children, properties = {}) {
  return {
    type: 'calloutElement',
    data: {
      hName,
      hProperties: {
        className: classNames,
        ...properties,
      },
    },
    children,
  };
}

function isStandaloneDisplayMath(mathNode, source) {
  if (!source || !mathNode.position) return false;

  const start = mathNode.position.start.offset;
  const end = mathNode.position.end.offset;
  const expression = source.slice(start, end);
  const lineEnd = source.indexOf('\n', end);
  const trailingSource = source.slice(end, lineEnd === -1 ? source.length : lineEnd);

  return expression.startsWith('$$') && expression.endsWith('$$') && !trailingSource.trim();
}

function transformBlockquote(node, source) {
  const firstParagraph = node.children?.[0];
  const firstText = firstParagraph?.type === 'paragraph' ? firstParagraph.children?.[0] : null;
  if (firstText?.type !== 'text') return;

  const marker = firstText.value.match(markerPattern);
  if (!marker) return;

  const suppliedType = marker[1].toLowerCase();
  const styleType = CALLOUT_TYPES.has(suppliedType) ? suppliedType : 'note';
  const titleClass = `callout-title-${styleType}`;
  firstText.value = firstText.value.slice(marker[0].length);

  const inlineNodes = firstParagraph.children;
  const mathIndex = inlineNodes.findIndex((child) => child.type === 'inlineMath');
  const titleNodes = mathIndex === -1 ? inlineNodes : inlineNodes.slice(0, mathIndex);
  const explicitTitle = plainText(titleNodes).trim();
  const title = explicitTitle || suppliedType.charAt(0).toUpperCase() + suppliedType.slice(1);

  const body = [];
  if (mathIndex !== -1) {
    const inlineMath = inlineNodes[mathIndex];
    const trailingNodes = inlineNodes.slice(mathIndex + 1);
    if (isStandaloneDisplayMath(inlineMath, source)) {
      body.push({
        ...inlineMath,
        type: 'math',
        data: {
          hName: 'pre',
          hChildren: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-math', 'math-display'] },
              children: [{ type: 'text', value: inlineMath.value }],
            },
          ],
        },
      });
      if (
        plainText(trailingNodes).trim() ||
        trailingNodes.some((child) => child.type !== 'text')
      ) {
        body.push({ type: 'paragraph', children: trailingNodes });
      }
    } else {
      body.push({
        type: 'paragraph',
        children: inlineNodes.slice(mathIndex),
        position: firstParagraph.position,
      });
    }
  }
  body.push(...node.children.slice(1));

  const fold = marker[2] || marker[3];
  const titleElement = calloutElement(
    styleType,
    fold ? 'summary' : 'div',
    ['markdown-callout-title', titleClass],
    [{ type: 'text', value: title }]
  );
  const bodyElement = calloutElement(
    styleType,
    'div',
    ['markdown-callout-body'],
    body
  );

  node.data = {
    ...node.data,
    hName: fold ? 'details' : 'div',
    hProperties: {
      className: ['markdown-callout', `callout-${styleType}`],
      ...(fold === '+' ? { open: true } : {}),
    },
  };
  node.children = [titleElement, bodyElement];
}

function visit(node, source) {
  if (!Array.isArray(node.children)) return;
  node.children.forEach((child) => visit(child, source));
  if (node.type === 'blockquote') transformBlockquote(node, source);
}

export default function remarkCallouts() {
  return (tree, file) => visit(tree, typeof file.value === 'string' ? file.value : '');
}
