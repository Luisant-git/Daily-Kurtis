import API_BASE_URL from "./config";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Something went wrong" }));
      throw new Error(err.message || err.detail || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const authApi = {
  requestOtp: async (phone) => {
    return request("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  },

  verifyOtp: async (phone, otp, name = "", email = "") => {
    return request("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, otp, name, email }),
    });
  },

  registerWithEmail: async (email, password, name) => {
    return request("/auth/user/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  loginWithEmail: async (email, password) => {
    return request("/auth/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};