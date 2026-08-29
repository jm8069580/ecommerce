import { expect, test } from "@playwright/test";
import { ADMIN, addToCartFromDetail, getProducts, login } from "./helpers";

test.describe("Coupons", () => {
  test.beforeEach(async ({ page, request }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await expect(page.locator('input[type="password"]')).toBeHidden({
      timeout: 15_000,
    });

    const products = await getProducts(request);
    test.skip(products.length === 0, "No hay productos en el catálogo");
    const product = products.reduce((a, b) => (b.price > a.price ? b : a));
    test.skip(product.price < 50, "Ningún producto supera el minSubtotal del cupón");

    await addToCartFromDetail(page, product);
    await page.goto("/checkout");
    await expect(page.getByText(/resumen del pedido/i)).toBeVisible();
  });

  test("cupón WELCOME10 aplica descuento", async ({ page }) => {
    const input = page.getByPlaceholder(/c[oó]digo de cupon/i);
    await input.fill("WELCOME10");
    await input.press("Enter");

    await expect(page.getByText("WELCOME10")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/^-\S*\s*\d/).first()).toBeVisible();
  });

  test("cupón inválido muestra error", async ({ page }) => {
    const input = page.getByPlaceholder(/c[oó]digo de cupon/i);
    await input.fill("CODIGO_INEXISTENTE_999");
    await input.press("Enter");

    await expect(page.locator(".text-destructive").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("WELCOME10")).toBeHidden();
  });
});
