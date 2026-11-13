import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openNavigation(page: Page) {
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
}

test('original overview → Dynamic tab → configuration keeps the guide navigation', async ({ page }) => {
  await page.goto('./');
  await openNavigation(page);
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(navigation.locator('#guide-navigation a')).toHaveCount(14);
  await navigation.getByRole('link', { name: 'Dynamic Workflows', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dynamic Workflows', exact: true })).toBeVisible();
  await expect(page.locator('.badge-row').getByText('Public preview', { exact: true })).toBeVisible();
  await expect(page.locator('#example pre')).toContainText('ctx.parallel');
  await expect(page.locator('#example pre')).toContainText('result === null');
  await expect(page.locator('#local-vs-cloud')).toContainText('not feature-parity products');
  await expect(page.locator('#governance')).toContainText('post-paid soft ceiling');
  await expect(navigation.getByRole('link', { name: 'Dynamic Workflows', exact: true, includeHidden: true }))
    .toHaveAttribute('aria-current', 'page');
  await page.locator('#demo').scrollIntoViewIfNeeded();
  await expect(page.locator('#demo')).toContainText('syntax-checked only');
  await expect(page.locator('#sources a')).toHaveCount(5);
  await openNavigation(page);
  await navigation.getByRole('link', { name: 'Configuration', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Configuration Reference' })).toBeVisible();
  await expect(page.locator('#auth').locator('..')).toContainText('copilot-requests: write');
});

test('keyboard navigation and mobile dismissal preserve focus', async ({ page }) => {
  await page.goto('./dynamic-workflows/');
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  if (await toggle.isVisible()) {
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
  }
  const dynamicLink = page.locator('#guide-navigation').getByRole('link', { name: 'Dynamic Workflows', exact: true });
  await dynamicLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/dynamic-workflows\/$/);
  await page.keyboard.press('Tab');
  // The visible skip link is keyboard reachable and targets the existing main landmark.
  await page.getByRole('link', { name: /skip to/i }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toHaveAttribute('id', 'main-content');
});

test('changed Dynamic tab has no horizontal overflow or automated WCAG AA violations', async ({ page }) => {
  await page.goto('./dynamic-workflows/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dynamic Workflows');
  const widths = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('Home and Get Started use one bounded manual demo rather than activating automation', async ({ page }) => {
  await page.goto('./');
  await page.locator('#example').scrollIntoViewIfNeeded();
  await expect(page.locator('#example pre')).toContainText('workflow_dispatch:');
  await expect(page.locator('#example pre')).toContainText('staged: true');
  await expect(page.locator('#example')).toContainText('cloud execution were not run');
  await expect(page.locator('.stats-row')).toContainText('v1.2.2');
  await page.goto('./get-started/');
  await expect(page.locator('#token')).toContainText('not every workflow needs a PAT');
  await expect(page.locator('#first-workflow')).toContainText('backlog-briefing.md');
  await expect(page.locator('#first-workflow')).toContainText('not cloud-executed');
});
