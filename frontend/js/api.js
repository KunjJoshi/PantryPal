import { getToken, clearSession } from "./session.js";

const request = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      const path = window.location.pathname;
      if (path.endsWith("/pantry.html") || path.endsWith("/recipes.html")) {
        window.location.href = "login.html";
      }
    }
    const message = payload?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
};

export const api = {
  get: async (url) => {
    return request(url);
  },

  post: async (url, data) => {
    return request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  put: async (url, data) => {
    return request(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  delete: async (url) => {
    return request(url, { method: "DELETE" });
  },
};
