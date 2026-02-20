const TOKEN_KEY = "pantrypal_token";
const USERNAME_KEY = "pantrypal_username";

const getToken = () => localStorage.getItem(TOKEN_KEY);

const setSession = ({ token, username }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

const getUsername = () => localStorage.getItem(USERNAME_KEY);

const requireSession = () => {
  if (!getToken()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
};

const updateAuthNav = () => {
  const loginItem = document.getElementById("loginNavItem");
  const logoutItem = document.getElementById("logoutNavItem");
  const usernameBadge = document.getElementById("usernameBadge");
  const logoutBtn = document.getElementById("logoutBtn");
  const username = getUsername();
  const token = getToken();

  if (token && username) {
    if (loginItem) loginItem.classList.add("d-none");
    if (logoutItem) logoutItem.classList.remove("d-none");
    if (usernameBadge) usernameBadge.textContent = `Signed in: ${username}`;
  } else {
    if (loginItem) loginItem.classList.remove("d-none");
    if (logoutItem) logoutItem.classList.add("d-none");
    if (usernameBadge) usernameBadge.textContent = "";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      const token = getToken();
      if (token) {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error("Logout request failed:", error);
        }
      }
      clearSession();
      window.location.href = "login.html";
    });
  }
};

export { getToken, setSession, clearSession, getUsername, requireSession, updateAuthNav };
