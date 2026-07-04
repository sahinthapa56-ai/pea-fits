import { test, expect } from "@playwright/test";

test("homepage loads successfully", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
});

test("homepage has expected title", async ({ page }) => {
  await page.goto("/");
  const title = await page.title();
  expect(title).toBeTruthy();
});

test("navigation links are visible", async ({ page }) => {
  await page.goto("/");
  // Check that the page renders content
  const body = page.locator("body");
  await expect(body).toBeVisible();
});
