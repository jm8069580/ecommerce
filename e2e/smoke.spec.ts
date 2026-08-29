import { expect, test } from "@playwright/test";

test.describe("Smoke", () => {
  test("home carga con productos y navegación", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BasicTech/i);
    await expect(page.locator("header")).toBeVisible();
  });

  test("listado de productos muestra items del catálogo", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: /todos los productos/i })).toBeVisible();
  });

  test("página de login accesible", async ({ page }) => {
    await page.goto("/login");
    const email = page.locator('input[type="email"]');
    const password = page.locator('input[type="password"]');
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
  });
});
