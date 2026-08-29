import { expect, test } from "@playwright/test";
import { ADMIN, deleteExistingReview, getProducts, login } from "./helpers";

const COMMENT = `Test e2e reseña`;

test.describe("Reviews", () => {
  test("usuario autenticado puede publicar una reseña con rating", async ({
    page,
    request,
  }) => {
    const products = await getProducts(request);
    test.skip(products.length === 0, "No hay productos en el catálogo");
    const product = products[0];

    await deleteExistingReview(request, product.id);

    await login(page, ADMIN.email, ADMIN.password);
    await page.goto(`/products/${product.slug}`);

    await page
      .getByRole("button", { name: /escribir una reseña/i })
      .click({ timeout: 15_000 });

    await page.locator("#review-title").fill("Excelente producto");
    await page.locator("#review-comment").fill(COMMENT);
    await page.getByRole("button", { name: /publicar/i }).click();

    await expect(page.getByText(COMMENT).first()).toBeVisible({ timeout: 15_000 });
  });

  test("resumen de reseñas visible para visitantes anónimos", async ({
    page,
    request,
  }) => {
    const products = await getProducts(request);
    test.skip(products.length === 0, "No hay productos en el catálogo");
    const product = products[0];

    await page.goto(`/products/${product.slug}`);

    await expect(page.getByText(/\d+\s*reseñas/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: /escribir una reseña/i })).toBeHidden();
  });
});
