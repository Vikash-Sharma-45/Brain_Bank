import assert from 'node:assert/strict';
import test from 'node:test';
import { createSearchSnippet } from './searchSnippet.js';

test('search snippets omit math and Obsidian callout markers without changing source', () => {
  const source =
    '> [!formula] Model $$\\hat{\\beta} = (X^T X)^{-1} X^T y$$\n' +
    '> The estimate uses $\\beta_0$ and $\\beta_1$ in the model.';
  const original = source;
  const snippet = createSearchSnippet(source, 'estimate');

  assert.ok(!snippet.includes('[!formula]'));
  assert.ok(!snippet.includes('$$'));
  assert.ok(!snippet.includes('$'));
  assert.ok(snippet.includes('The estimate uses'));
  assert.equal(source, original);
});
