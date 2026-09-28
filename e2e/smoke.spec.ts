import { expect, test } from '@playwright/test';

test('the production build loads and renders the app shell', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle('Opinionated Recipes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Opinionated Recipes');
  expect(errors).toEqual([]);
});
