import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('foundation modules are present', () => {
  const content = readFileSync('src/state/store.ts', 'utf8');
  assert.ok(content.includes('class AppStore'));
});

test('roadmap is locked config', () => {
  const content = readFileSync('src/data/roadmap.ts', 'utf8');
  assert.ok(content.includes('locked: true'));
});
