/** Existing guide tabs, with local orchestration beside the cloud CLI reference. */
export const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'Get Started', id: 'get-started' },
  { label: 'Agentic DevOps', id: 'agentic-devops' },
  { label: 'Core Concepts', id: 'core-concepts' },
  { label: 'Architecture', id: 'architecture' },
  { label: 'Configuration', id: 'configuration' },
  { label: 'Security', id: 'security' },
  { label: 'Ecosystem', id: 'ecosystem' },
  { label: 'Use Cases', id: 'use-cases' },
  { label: 'Continuous AI', id: 'continuous-ai' },
  { label: 'CLI & Tooling', id: 'cli-tooling' },
  { label: 'Dynamic Workflows', id: 'dynamic-workflows' },
  { label: 'Videos', id: 'videos' },
  { label: 'Resources', id: 'resources' },
];

/** Resolve a guide tab under either the GitHub Pages base or a root deployment. */
export function navigationHref(base, id) {
  const prefix = base.replace(/\/?$/, '/');
  return `${prefix}${id === 'home' ? '' : `${id}/`}`;
}
