const API_URL = process.env.REACT_APP_API_URL || "";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  if (data === null) {
    throw new Error("API did not return JSON");
  }

  return data;
};

export const api = {
  getProducts: () => request("/api/products"),
  getCategories: () => request("/api/categories"),
  login: (credentials) => request("/api/auth/login", { method: "POST", body: credentials }),
  createProduct: (product, token) => request("/api/products", { method: "POST", body: product, token }),
  updateProduct: (id, product, token) => request(`/api/products/${id}`, { method: "PUT", body: product, token }),
  deleteProduct: (id, token) => request(`/api/products/${id}`, { method: "DELETE", token }),
  createCategory: (name, token) => request("/api/categories", { method: "POST", body: { name }, token }),
  updateCategory: (id, name, token) => request(`/api/categories/${id}`, { method: "PUT", body: { name }, token }),
  deleteCategory: (id, token) => request(`/api/categories/${id}`, { method: "DELETE", token }),
  uploadImage: async (file, token) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Image upload failed");
    }
    return data;
  }
};
