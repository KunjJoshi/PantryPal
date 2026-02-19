import { api } from "./api.js";

const container = document.getElementById("recipeContainer");
const searchInput = document.getElementById("searchInput");
const cuisineButtons = document.querySelectorAll(".cuisine-btn");

let currentCuisine = "";

const loadRecipes = async () => {
  const search = searchInput.value;

  const url = `/api/recipes?cuisine=${currentCuisine}&search=${search}`;

  const recipes = await api.get(url);
  renderRecipes(recipes);
};

const renderRecipes = (recipes) => {
  container.innerHTML = "";

  recipes.forEach((recipe) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    col.innerHTML = `
        <div class="card recipe-card shadow-sm position-relative">
            
            <button class="delete-btn"
            onclick="deleteRecipe('${recipe.id}')">
            ✕
            </button>

            <img src="${recipe.imageUrl}" class="card-img-top" />

            <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title">${recipe.title}</h5>
                <span class="badge-status ${badgeClass(recipe.status)}">
                ${recipe.status}
                </span>
            </div>

            <p class="card-text">${recipe.description}</p>
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

window.deleteRecipe = async (id) => {
  await api.delete(`/api/recipes/${id}`);
  loadRecipes();
};

document
  .getElementById("addRecipeForm")
  .addEventListener("submit", async (e) => {
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
      imageUrl: form.get("imageUrl")
    };

    await api.post("/api/recipes", recipe);
    e.target.reset();
    loadRecipes();
  });

searchInput.addEventListener("input", loadRecipes);

cuisineButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    currentCuisine = btn.dataset.cuisine;
    loadRecipes();
  })
);

loadRecipes();
