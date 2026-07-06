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

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Something went wrong" }));
      throw new Error(err.message || err.detail || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Banner API Error:", error);
    throw error;
  }
}

export const bannerApi = {
  getBanners: async () => {
    return request("/banners/active");
  },
};