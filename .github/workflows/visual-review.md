---
name: "Visual Page Review"
description: "Build the site, screenshot every page with Playwright, and review for visual issues on PRs"

on:
  pull_request:
    types: [opened, synchronize]
  reaction: "eyes"
  status-comment: true
  roles: [admin, maintainer, write]

permissions:
  contents: read
  pull-requests: read
  copilot-requests: write

# Compile with v1.2.2's supported rootless Docker runtime. AWF receives the
# inference environment directly; isolation and its API proxy remain enabled.
# Do not use an internal command override or disable strict validation.
# Inference uses the per-run Actions token, not a stored personal access token.
sandbox:
  agent:
    runtime: docker

# Temporary, presence-only boundary diagnostics. Never execute repository code
# with the inference credential or print its value, size, or fingerprint.
steps:
  - name: Check inference credential boundary (presence only)
    shell: bash
    working-directory: /tmp
    env:
      COPILOT_GITHUB_TOKEN: ${{ github.token }}
      NODE_OPTIONS: ""
    run: |
      set -euo pipefail
      printf 'auth_presence_v2_actions_token\n'
      node -e 'console.log("runner_copilot_present=" + Boolean(process.env.COPILOT_GITHUB_TOKEN))'
      sudo -E "$(command -v node)" -e 'console.log("sudo_copilot_present=" + Boolean(process.env.COPILOT_GITHUB_TOKEN))'

# Deterministic validation has read-only repository access and no inference
# credential. It gates the agent independently of probabilistic review.
jobs:
  test_coverage:
    name: Test and coverage
    runs-on: ubuntu-latest
    needs: activation
    permissions:
      contents: read
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          persist-credentials: false
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: "24.22.1"
          cache: npm
      - name: Install locked dependencies
        run: npm ci
      - name: Install browser test runtime
        run: npx playwright install --with-deps chromium
      - name: Run complete suite with coverage thresholds
        run: npm run test:all
      - name: Upload coverage and browser results
        if: always()
        uses: actions/upload-artifact@bbbca2ddaa5d8feaa63e36b76fdaad77386f024f # v7
        with:
          name: test-coverage
          path: |
            coverage/
            playwright-report/
            test-results/
          retention-days: 7

tools:
  playwright:
  bash: ["npm", "npx", "node", "cat", "ls", "find", "grep", "head", "tail", "wc", "curl", "sleep", "kill", "echo"]
  edit:

safe-outputs:
  add-comment:
    max: 1
    hide-older-comments: true
  upload-asset:
    allowed-exts: [.png]
    max: 20

network:
  allowed:
    - defaults
    - playwright
    - node
    - github
    - local
---

# Visual Page Reviewer

You are a visual QA reviewer for the **GitHub Agentic Workflows documentation site** — an Astro static site deployed to GitHub Pages.

## Your Task

When a PR is opened or updated, build the site, take screenshots of every page, and review them for visual quality issues.

## Step-by-Step Process

### 1. Install Dependencies & Build

```bash
npm ci
npx astro build
```

### 2. Serve the Built Site

Start a local preview server for the built site:

```bash
npx astro preview --port 4321 &
sleep 3
```

The site is served at `http://localhost:4321/gh-aw-overview/`.

### 3. Screenshot Every Page

Use Playwright to navigate to each page and take a full-page screenshot. The pages are:

| Page | URL Path |
|------|----------|
| Home | `/gh-aw-overview/` |
| Core Concepts | `/gh-aw-overview/core-concepts/` |
| Architecture | `/gh-aw-overview/architecture/` |
| Configuration | `/gh-aw-overview/configuration/` |
| Security | `/gh-aw-overview/security/` |
| Ecosystem | `/gh-aw-overview/ecosystem/` |
| Use Cases | `/gh-aw-overview/use-cases/` |
| Continuous AI | `/gh-aw-overview/continuous-ai/` |
| CLI & Tooling | `/gh-aw-overview/cli-tooling/` |
| Videos | `/gh-aw-overview/videos/` |
| Resources | `/gh-aw-overview/resources/` |

For each page:
1. Navigate to the URL at `http://localhost:4321{path}`
2. Wait for the page to fully load (wait for network idle)
3. Take a **full-page screenshot** (not just the viewport) at 1280px width
4. Save as `{page-name}.png` (e.g., `home.png`, `core-concepts.png`)

### 4. Review Each Screenshot

Evaluate each page screenshot for:

- **Layout issues** — broken grids, overlapping elements, content overflowing containers
- **Spacing problems** — excessive gaps between hero and content, inconsistent padding
- **Navigation** — all nav items visible, active state correct, mobile toggle present
- **Typography** — text readable, headings properly sized, code blocks formatted
- **Cards and components** — card grids aligned, borders visible, hover states reasonable
- **Hero section** — emoji, title, and subtitle properly centered and spaced
- **Footer** — present and properly positioned at bottom
- **Content completeness** — page has content (not blank or error page)
- **404 check** — page actually loaded (not a 404)
- **Responsive concerns** — nothing obviously broken at 1280px desktop width

### 5. Upload Screenshots & Comment

Upload all screenshots using the upload-asset safe output.

Then post a single PR comment with your review:

**Format your comment as:**

```markdown
## 🔍 Visual Page Review

**Pages reviewed:** {count}
**Issues found:** {count}

### ✅ Pages Looking Good
- **Home** — Hero renders correctly, nav links working, cards aligned
- **Core Concepts** — Timeline layout clean, cards properly spaced
- ...

### ⚠️ Issues Found
- **{Page Name}** — {description of issue}
  - Severity: Minor/Major/Critical
  - What's wrong: {specific description}
  - Suggestion: {how to fix}

### 📸 Screenshots
Screenshots uploaded as workflow assets for manual review.

### Summary
{1-2 sentence overall assessment}
```

## Rules

- Review ALL pages, not just a subset
- Be specific about issues — reference exact elements
- Rate severity accurately: Critical = broken/unusable, Major = noticeable UX problem, Minor = cosmetic
- If everything looks good, say so — don't invent problems
- Do NOT modify any code — this is a review-only workflow
- Keep the comment concise but thorough
