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
    console.error("API Error:", error);
    throw error;
  }
}

export const shippingApi = {
  fetchShippingRules: async () => {
    return request("/shipping", {
      method: "GET",
    });
  },
};
