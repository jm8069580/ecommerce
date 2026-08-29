import type { APIRequestContext, Page } from "@playwright/test";

export const ADMIN = {
  email: "admin@basictech.com",
  password: "admin123",
};

export const API_URL = process.env.API_URL ?? "http://localhost:3001";

export interface ProductApi {
  id: string;
  slug: string;
  name: string;
  price: number;
}

export async function getProducts(request: APIRequestContext): Promise<ProductApi[]> {
  const res = await request.get(`${API_URL}/products`);
  const data = await res.json();
  return data.products ?? data.items ?? [];
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /iniciar sesión|ingresar|entrar|login/i }).click();
}

export async function apiLoginAsAdmin(request: APIRequestContext) {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: ADMIN.email, password: ADMIN.password },
  });
  const data = await res.json();
  return data.accessToken as string;
}

export async function deleteExistingReview(request: APIRequestContext, productId: string) {
  const token = await apiLoginAsAdmin(request);
  await request.delete(`${API_URL}/reviews/product/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addToCartFromDetail(page: Page, product: ProductApi) {
  await page.goto(`/products/${product.slug}`);
  await page.getByRole("button", { name: /agregar al carrito/i }).first().click();
}
