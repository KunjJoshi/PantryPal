import { api } from "./api.js";
import { requireSession, updateAuthNav } from "./session.js";

if (!requireSession()) {
  throw new Error("Authentication required");
}
updateAuthNav();

const container = document.getElementById("recipeContainer");
const searchInput = document.getElementById("searchInput");
const cuisineButtons = document.querySelectorAll(".cuisine-btn");
const pageInfo = document.getElementById("pageInfo");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");

let currentCuisine = "";
let currentPage = 1;
const pageLimit = 9;
let totalPages = 1;

const loadRecipes = async () => {
  const search = searchInput.value;

  const url = `/api/recipes?cuisine=${encodeURIComponent(
    currentCuisine
  )}&search=${encodeURIComponent(search)}&page=${currentPage}&limit=${pageLimit}`;

  const result = await api.get(url);
  const recipes = Array.isArray(result) ? result : result.items || [];
  const pagination = result.pagination || {
    page: currentPage,
    totalPages: 1,
  };

  currentPage = pagination.page || 1;
  totalPages = pagination.totalPages || 1;
  updatePaginationControls();
  renderRecipes(recipes);
};

const renderRecipes = (recipes) => {
  container.innerHTML = "";

  recipes.forEach((recipe) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="card recipe-card shadow-sm position-relative">
        <button class="delete-btn" onclick="deleteRecipe('${recipe.id}')">&times;</button>

        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title">${recipe.title}</h5>
            <span class="badge-status ${badgeClass(recipe.status)}">${recipe.status}</span>
          </div>

          <p class="card-text">${recipe.description || ""}</p>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
};

const badgeClass = (status) => {
  if (status.includes("Ready")) return "ready";
  if (status.includes("1")) return "warning";
  return "missing";
};

const updatePaginationControls = () => {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
};

window.deleteRecipe = async (id) => {
  await api.delete(`/api/recipes/${id}`);
  await loadRecipes();
  document.dispatchEvent(new Event("recipes:changed"));
};

document.getElementById("addRecipeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);

  const recipe = {
    title: form.get("title"),
    cuisine: form.get("cuisine"),
    ingredients: form
      .get("ingredients")
      .split(",")
      .map((i) => i.trim()),
    description: form.get("description"),
  };

  await api.post("/api/recipes", recipe);
  currentPage = 1;
  e.target.reset();
  await loadRecipes();
  document.dispatchEvent(new Event("recipes:changed"));
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  loadRecipes();
});

cuisineButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    currentCuisine = btn.dataset.cuisine;
    currentPage = 1;
    loadRecipes();
  })
);

prevPageBtn.addEventListener("click", () => {
  if (currentPage <= 1) return;
  currentPage -= 1;
  loadRecipes();
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage >= totalPages) return;
  currentPage += 1;
  loadRecipes();
});

loadRecipes();
