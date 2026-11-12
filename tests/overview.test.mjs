import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { navItems, navigationHref } from '../src/data/navigation.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('preserves every existing tab and adds Dynamic Workflows beside CLI', () => {
  assert.deepEqual(navItems.map(({ id }) => id), [
    'home', 'get-started', 'agentic-devops', 'core-concepts', 'architecture',
    'configuration', 'security', 'ecosystem', 'use-cases', 'continuous-ai',
    'cli-tooling', 'dynamic-workflows', 'videos', 'resources',
  ]);
  assert.equal(new Set(navItems.map(({ id }) => id)).size, navItems.length);
  for (const { id, label } of navItems) {
    assert.ok(label.length > 0);
    const route = id === 'home' ? 'index' : id;
    assert.ok(existsSync(new URL(`../src/pages/${route}.astro`, import.meta.url)));
  }
});

test('resolves home and nested routes for Pages and root deployments', () => {
  for (const base of ['/gh-aw-overview', '/gh-aw-overview/']) {
    assert.equal(navigationHref(base, 'home'), '/gh-aw-overview/');
    assert.equal(navigationHref(base, 'dynamic-workflows'), '/gh-aw-overview/dynamic-workflows/');
  }
  for (const base of ['', '/']) {
    assert.equal(navigationHref(base, 'home'), '/');
    assert.equal(navigationHref(base, 'security'), '/security/');
  }
});

test('new tab uses the existing layout, collection, and accessible navigation', () => {
  const wrapper = read('src/pages/dynamic-workflows.astro');
  assert.match(wrapper, /BaseLayout/);
  assert.match(wrapper, /getEntry\('pages', 'dynamic-workflows'\)/);
  assert.match(wrapper, /currentPage="dynamic-workflows"/);
  const nav = read('src/components/Navigation.astro');
  assert.match(nav, /aria-current=/);
  assert.match(nav, /aria-controls="guide-navigation"/);
  assert.match(nav, /event.key === 'Escape'/);
});

test('Dynamic source distinguishes preview, authority, failures, and validation', () => {
  const source = read('src/content/pages/dynamic-workflows.mdx');
  for (const phrase of [
    'Public preview', 'October 1, 2026', 'probabilistic', 'not feature-parity',
    'post-paid soft ceiling', 'not an', 'authenticated PR approval',
    'result === null', 'agent inference', 'syntax-checked only',
  ]) {
    // Whitespace between Markdown lines must not hide a regression.
    assert.ok(source.replace(/\s+/g, ' ').includes(phrase), phrase);
  }
  assert.match(source, /https:\/\/docs\.github\.com\/en\/copilot\/concepts\/agents\/dynamic-workflows/);
  const snippet = source.match(/```js\n([\s\S]*?)\n```/);
  assert.ok(snippet, 'complete illustrative JavaScript is present');
  const checked = spawnSync(process.execPath, ['--check', '--input-type=module'], {
    input: snippet[1], encoding: 'utf8',
  });
  assert.equal(checked.status, 0, checked.stderr);
});

test('homepage renders the exact manually triggered, staged compiler sample', () => {
  const sample = read('examples/backlog-briefing.md');
  assert.match(sample, /workflow_dispatch:/);
  assert.match(sample, /copilot-requests: write/);
  assert.match(sample, /staged: true/);
  assert.match(sample, /max: 1/);
  assert.doesNotMatch(sample, /schedule:|contents: write|issues: write/);
  assert.match(read('src/components/HomeCodeExample.astro'), /examples\/backlog-briefing\.md\?raw/);
  assert.match(read('src/content/pages/get-started.mdx'), /backlog-briefing\.md/);
});

test('refresh fixes critical auth, compilation, and absolute containment claims', () => {
  for (const page of ['configuration', 'get-started']) {
    const source = read(`src/content/pages/${page}.mdx`);
    assert.match(source, /copilot-requests: write/);
    assert.doesNotMatch(source, /Every agentic workflow needs.*COPILOT_GITHUB_TOKEN|Always.*every workflow/);
  }
  assert.match(read('src/content/pages/architecture.mdx'), /body-only instruction edits do not/);
  assert.doesNotMatch(read('src/content/pages/index.mdx'), /Agents can't escape|first production implementation|4,167\+|313\+/);
  assert.doesNotMatch(read('src/content/pages/agentic-devops.mdx'), /does in 30 minutes|context never leaks|first production implementation/);
});
