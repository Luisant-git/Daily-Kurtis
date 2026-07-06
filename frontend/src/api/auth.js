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

export const authApi = {
  requestOtp: async (phone) => {
    return request("/auth/otp/request", {
      method: "POST",
      body: { phone },
    });
  },

  verifyOtp: async (phone, otp, name = "", email = "") => {
    return request("/auth/otp/verify", {
      method: "POST",
      body: { phone, otp, name, email },
    });
  },

  registerWithEmail: async (email, password, name) => {
    return request("/auth/user/register", {
      method: "POST",
      body: { email, password, name },
    });
  },

  loginWithEmail: async (email, password) => {
    return request("/auth/user/login", {
      method: "POST",
      body: { email, password },
    });
  },

  fetchProfile: async (token) => {
    return request("/user/profile/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  updateProfile: async (token, data) => {
    return request("/user/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: data,
    });
  },

updateShippingAddress: async (token, address) => {
  // Ensure all values are strings before sending
  const sanitizedAddress = {
    name: String(address.name || ""),
    addressLine: String(address.addressLine || ""),
    landmark: String(address.landmark || ""),
    city: String(address.city || ""),
    state: String(address.state || ""),
    pincode: String(address.pincode || ""),
    mobile: String(address.mobile || ""),
  };
  
  return request("/user/profile/address", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: sanitizedAddress,
  });
},

  fetchOrders: async (token) => {
    return request("/orders", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
};
