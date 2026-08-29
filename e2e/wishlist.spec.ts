import { expect, test } from "@playwright/test";
import { ADMIN, login } from "./helpers";

test.describe("Wishlist", () => {
  test("agregar y quitar producto de favoritos con UI optimista", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await expect(page.locator('input[type="password"]')).toBeHidden({
      timeout: 15_000,
    });

    await page.goto("/products");

    const favBtn = page
      .locator("div.group button", { hasText: /favoritos/i })
      .first();
    await expect(favBtn).toBeVisible({ timeout: 15_000 });

    const card = favBtn.locator(
      "xpath=ancestor::div[contains(@class,'group')][1]",
    );
    const href = await card
      .locator('a[href^="/products/"]')
      .first()
      .getAttribute("href");
    test.skip(!href, "No se encontró el link del producto");

    const label = () => favBtn.locator(".sr-only").innerText();

    if ((await label()) === "Quitar de favoritos") {
      await favBtn.click();
      await expect(favBtn.filter({ hasText: "Agregar a favoritos" })).toBeVisible({
        timeout: 10_000,
      });
    }

    await favBtn.click();
    await expect(favBtn.filter({ hasText: "Quitar de favoritos" })).toBeVisible({
      timeout: 10_000,
    });

    await page.goto("/profile/favorites");
    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/products");
    const anyHeart = page
      .locator("div.group button", { hasText: /favoritos/i })
      .first();
    await expect(anyHeart.filter({ hasText: "Quitar de favoritos" })).toBeVisible({
      timeout: 15_000,
    });
    await anyHeart.click();
    await expect(anyHeart.filter({ hasText: "Agregar a favoritos" })).toBeVisible({
      timeout: 10_000,
    });

    await page.goto("/profile/favorites");
    await expect(page.getByText(/no tienes favoritos/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("botón de favoritos deshabilitado para anónimos", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/products");

    const favBtn = page
      .locator("div.group button", { hasText: /favoritos/i })
      .first();
    await expect(favBtn).toBeVisible({ timeout: 15_000 });
    await expect(favBtn).toBeDisabled();
  });
});
