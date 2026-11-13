import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const source = read('.github/workflows/visual-review.md');
const lock = read('.github/workflows/visual-review.lock.yml');
const diagnostic = source.match(/  - name: Check inference credential boundary \(presence only\)\n([\s\S]*?)(?=\n# Deterministic)/)?.[1];

test('boundary probe uses only inline boolean diagnostics, not repository code', () => {
  assert.ok(diagnostic);
  assert.match(diagnostic, /working-directory: \/tmp/);
  assert.match(diagnostic, /NODE_OPTIONS: ""/);
  assert.match(diagnostic, /COPILOT_GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
  assert.doesNotMatch(source, /secrets\.COPILOT_GITHUB_TOKEN/);
  assert.match(diagnostic, /sudo -E "\$\(command -v node\)" -e/);
  assert.doesNotMatch(diagnostic, /printenv|console\.log\(process\.env\)|JSON\.stringify|\.length|createHash|require\(|import |npm |curl |tee|\n\s+GITHUB_TOKEN:/);
});

test('runner and sudo probes never print dummy credentials, including missing and shadowed cases', () => {
  assert.ok(diagnostic);
  const scripts = [...diagnostic.matchAll(/-e '([^']+)'/g)].map((match) => match[1]);
  assert.equal(scripts.length, 2);
  const sentinel = 'dummy-only-never-a-real-credential';
  const cases = [
    { env: {}, present: false },
    { env: { COPILOT_GITHUB_TOKEN: sentinel }, present: true },
    { env: { COPILOT_GITHUB_TOKEN: '' }, present: false },
    { env: { GITHUB_TOKEN: sentinel }, present: false },
    // Explicit empty override models a credential shadowed at a later boundary.
    { env: { ...{ COPILOT_GITHUB_TOKEN: sentinel }, COPILOT_GITHUB_TOKEN: '' }, present: false },
  ];
  for (const [index, script] of scripts.entries()) {
    for (const { env, present } of cases) {
      const result = spawnSync(process.execPath, ['-e', script], { env, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      const label = ['runner', 'sudo'][index];
      assert.equal(result.stdout.trim(), `${label}_copilot_present=${present}`);
      assert.equal(result.stderr, '');
      assert.ok(!result.stdout.includes(sentinel));
    }
  }
});

test('generated diagnostic preserves secret naming and existing isolation', () => {
  assert.match(lock, /name: Check inference credential boundary \(presence only\)/);
  assert.match(lock, /auth_presence_v2_actions_token/);
  assert.match(lock, /runner_copilot_present=/);
  assert.match(lock, /sudo_copilot_present=/);
  assert.match(source, /sandbox:\s*\n\s*agent:\s*\n\s*runtime: docker/);
  assert.doesNotMatch(source, /sandbox:\s*\n\s*agent:\s*false|command:|strict: false|sudoers|env_keep/);
  assert.match(lock, /GH_AW_VERSION: v1\.2\.2/);
  assert.match(lock, /install_awf_binary\.sh" v0\.29\.11 --rootless/);
  assert.match(lock, /awf --config "\$\{RUNNER_TEMP\}\/gh-aw\/awf-config\.json"/);
  assert.match(lock, /--exclude-env COPILOT_GITHUB_TOKEN/);
  assert.match(lock, /ghcr\.io\/github\/gh-aw-firewall\/api-proxy:0\.29\.11@sha256:/);
  assert.doesNotMatch(lock, /sudo -E awf|--legacy-security|--enable-host-access/);
  assert.match(source, /permissions:\n  contents: read\n  pull-requests: read\n  copilot-requests: write/);
  assert.match(lock, /COPILOT_GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
  assert.doesNotMatch(source, /continue-on-error: true/);
});

test('full-suite coverage gate is read-only and receives no inference secrets', () => {
  const job = source.match(/  test_coverage:\n([\s\S]*?)(?=\ntools:)/)?.[1];
  assert.ok(job);
  assert.match(job, /needs: activation/);
  assert.match(job, /contents: read/);
  assert.match(job, /persist-credentials: false/);
  assert.match(job, /node-version: "24\.22\.1"/);
  assert.match(job, /npm run test:all/);
  assert.match(job, /retention-days: 7/);
  assert.doesNotMatch(job, /secrets\.|continue-on-error|contents: write|pull-requests: write/);
  const agentJob = lock.match(/\n  agent:\n([\s\S]*?)(?=\n  [a-z_]+:)/)?.[1];
  assert.ok(agentJob);
  assert.match(agentJob, /\n\s+needs:\n\s+- activation\n\s+- test_coverage\n/);
  assert.match(agentJob, /copilot-requests: write/);
  assert.doesNotMatch(agentJob, /COPILOT_GITHUB_TOKEN: \$\{\{ secrets\.COPILOT_GITHUB_TOKEN/);
});

test('authentication guidance includes documented personal-repository Actions billing', () => {
  for (const page of ['configuration', 'get-started']) {
    const content = read(`src/content/pages/${page}.mdx`);
    assert.match(content, /copilot-requests: write/);
    assert.match(content, /owner.{0,6}seat|owner's Copilot seat/);
    assert.match(content, /personal(?:ly-owned)? repositories/);
    assert.match(content, /docs\.github\.com\/en\/copilot\/concepts\/agent-capabilities\/agent-powered-workflows-and-operations\/copilot-cli-in-github-actions/);
  }
});
