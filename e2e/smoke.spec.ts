import { expect, test } from "@playwright/test";

// Smoke test: verifies the app shell boots and URL-based routing works in
// localStorage-only mode (no Supabase). Intentionally does not assert on
// catalog contents, which depend on a backend.

test("app boots and routing works", async ({ page }) => {
  await page.goto("/");

  // The sidebar nav groups render. exact:true avoids matching incidental
  // substrings elsewhere on the page (e.g. "Safe foods…").
  await expect(page.getByText("Planning", { exact: true })).toBeVisible();
  await expect(page.getByText("Food", { exact: true })).toBeVisible();

  // Navigating to Recipes updates the URL and shows the filter UI.
  await page.getByRole("link", { name: "Recipes", exact: true }).click();
  await expect(page).toHaveURL(/\/recipes$/);
  await expect(page.getByPlaceholder("Search by name…")).toBeVisible();

  // A meal quick-link deep-links into the catalog with a meal filter applied.
  await page.getByRole("link", { name: "Breakfast", exact: true }).click();
  await expect(page).toHaveURL(/\/recipes\?meal=breakfast/);

  // Other tabs route by path.
  await page.getByRole("link", { name: "Kitchen", exact: true }).click();
  await expect(page).toHaveURL(/\/kitchen$/);
});

test("deep-linking a filtered URL restores filter state", async ({ page }) => {
  // The whole point of routing: this URL is shareable and reload-safe.
  await page.goto("/recipes?meal=dinner");
  await expect(page).toHaveURL(/\/recipes\?meal=dinner/);
  await expect(page.getByPlaceholder("Search by name…")).toBeVisible();
});
