import { api } from "./api.js";
import { getToken, setSession, clearSession } from "./session.js";

const authMessage = document.getElementById("authMessage");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (getToken()) {
  window.location.href = "index.html";
}

const showError = (message) => {
  authMessage.textContent = message;
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");
  const form = new FormData(loginForm);

  try {
    const response = await api.post("/api/auth/login", {
      username: form.get("username"),
      password: form.get("password"),
    });
    setSession(response);
    window.location.href = "index.html";
  } catch (error) {
    clearSession();
    showError(error.message);
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");
  const form = new FormData(registerForm);

  try {
    const response = await api.post("/api/auth/register", {
      username: form.get("username"),
      password: form.get("password"),
    });
    setSession(response);
    window.location.href = "index.html";
  } catch (error) {
    clearSession();
    showError(error.message);
  }
});
