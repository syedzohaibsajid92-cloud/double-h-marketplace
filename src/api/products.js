import { api } from "./client";
import { adaptProduct, adaptCategory } from "./adapters";

export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await api.get(`/api/products${qs ? `?${qs}` : ""}`);
  return (res.products || []).map(adaptProduct);
}

export async function createProduct({ name, description, brand, sku, price, stock, category_id, image_url }) {
  const res = await api.post(
    "/api/products",
    { name, description, brand, sku, price, stock, category_id, image_url },
    { auth: true }
  );
  return adaptProduct(res.product);
}

export async function updateProduct(id, updates) {
  const res = await api.put(`/api/products/${id}`, updates, { auth: true });
  return adaptProduct(res.product);
}

export async function fetchCategories() {
  const res = await api.get("/api/categories");
  return (res.categories || []).map(adaptCategory);
}

export async function createCategory(name) {
  const res = await api.post("/api/categories", { name }, { auth: true });
  return adaptCategory(res.category);
}
export async function deleteProduct(id) {
  await api.del(`/api/products/${id}`, { auth: true });
  return true;
}