# GitHub Agentic Workflows — The Complete Guide

A comprehensive documentation site covering GitHub Agentic Workflows (gh-aw) — AI-powered repository automation with natural language instructions, strong guardrails, and continuous AI.

**Live site:** [htekdev.github.io/gh-aw-overview](https://htekdev.github.io/gh-aw-overview)

## Tech Stack

- **[Astro](https://astro.build/)** — Static site generator (zero JS shipped by default)
- **[MDX](https://mdxjs.com/)** — Markdown + JSX for content pages
- **[Shiki](https://shiki.style/)** — Syntax highlighting (GitHub Dark theme)
- **GitHub Pages** — Hosting via GitHub Actions

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── content/pages/       # MDX content for each page
│   ├── index.mdx
│   ├── core-concepts.mdx
│   ├── architecture.mdx
│   ├── configuration.mdx
│   ├── security.mdx
│   ├── ecosystem.mdx
│   ├── use-cases.mdx
│   ├── cli-tooling.mdx
│   ├── videos.mdx
│   └── resources.mdx
├── pages/               # Astro page wrappers
├── layouts/             # BaseLayout (shared nav/footer/head)
├── components/          # Reusable Astro components
└── styles/global.css    # Design system (CSS custom properties)

.github/
├── workflows/           # GitHub Actions + Agentic Workflows
│   ├── pages.yml        # GitHub Pages deployment (Astro build)
│   ├── chatops-assistant.md
│   ├── continuous-documentation.md
│   ├── continuous-links.md
│   ├── continuous-quality.md
│   ├── continuous-reporting.md
│   └── continuous-triage.md
├── agents/              # Copilot agent configuration
└── aw/                  # Agentic workflow action pinning
```

## Agentic Workflows

This repository uses **GitHub Agentic Workflows** for automated maintenance:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| ChatOps Assistant | `/explain` command | Answer GH-AW questions via ChatOps |
| Continuous Documentation | Weekly (Monday) | Scan content for outdated information |
| Continuous Links | Daily | Validate all external URLs |
| Continuous Triage | Issue opened | Auto-label and respond to issues |
| Continuous Reporting | Weekly (Friday) | Generate repository status report |
| Continuous Quality | Deploy failure | Investigate and fix deployment issues |

## Content

The site covers 10 topic areas:

1. **Home** — Overview, Six Pillars, project stats
2. **Core Concepts** — Philosophy, Continuous AI, markdown-first authoring
3. **Architecture** — Pipeline, trust model, runtime execution
4. **Configuration** — Frontmatter schema, triggers, permissions, tools
5. **Security** — AWF, threat detection, governance
6. **Ecosystem** — AI engines, MCP, tools, extensibility
7. **Use Cases** — ChatOps, DailyOps, IssueOps patterns
8. **CLI & Tooling** — `gh aw` command reference
9. **Videos** — Curated video library with filtering
10. **Resources** — Official docs, blog series, community links

## License

This is a community resource documenting the MIT-licensed [github/gh-aw](https://github.com/github/gh-aw) project.

Built with ⚡ by [htekdev](https://github.com/htekdev)
