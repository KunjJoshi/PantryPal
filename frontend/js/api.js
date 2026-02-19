export const api = {
  get: async (url) => {
    const res = await fetch(url);
    return res.json();
  },

  post: async (url, data) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  put: async (url, data) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (url) => {
    const res = await fetch(url, { method: "DELETE" });
    return res.json();
  }
};
