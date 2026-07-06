import API_BASE_URL from "./config";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Something went wrong" }));
      const message = Array.isArray(err.message)
        ? err.message.join(", ")
        : err.message || err.detail || `HTTP ${response.status}`;
      const error = new Error(message);
      error.response = err;
      throw error;
    }
    return await response.json();
  } catch (error) {
    console.error("Cart API Error:", error);
    throw error;
  }
}

export const cartApi = {
  getCart: async (token) => {
    return request("/cart", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  addToCart: async (token, itemData) => {
    return request("/cart/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: itemData,
    });
  },

  updateQuantity: async (token, itemId, quantity) => {
    return request(`/cart/${itemId}/quantity`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { quantity },
    });
  },

  removeFromCart: async (token, itemId) => {
    return request(`/cart/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  clearCart: async (token) => {
    return request("/cart", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
