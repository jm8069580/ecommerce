import { expect, test } from "@playwright/test";
import { ADMIN, login } from "./helpers";

test.describe("Auth", () => {
  test("login con credenciales de admin redirige y guarda sesión", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await expect(page.locator("input[type='password']")).toBeHidden({ timeout: 15_000 });

    const user = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("bts_user") ?? "null"),
    );
    expect(user?.email).toBe(ADMIN.email);
  });

  test("login con credenciales inválidas muestra error y no crea sesión", async ({ page }) => {
    await login(page, ADMIN.email, "wrong-password");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });

    const token = await page.evaluate(() => localStorage.getItem("bts_access_token"));
    expect(token).toBeNull();
  });

  test("rutas protegidas redirigen a login sin sesión", async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
