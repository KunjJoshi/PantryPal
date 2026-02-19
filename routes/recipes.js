import express from "express";
import { recipes, pantry } from "../data/store.js";

const router = express.Router();

router.get("/", (req, res) => {
  const { cuisine, search } = req.query;

  let filtered = recipes;

  if (cuisine) {
    filtered = filtered.filter(
      (r) => r.cuisine === cuisine
    );
  }

  if (search) {
    filtered = filtered.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  const pantryNames = pantry.map((p) =>
    p.name.toLowerCase()
  );

  const matched = filtered.map((recipe) => {
    const missing = recipe.ingredients.filter(
      (ing) => !pantryNames.includes(ing.toLowerCase())
    );

    let status = "Missing Several Ingredients";

    if (missing.length === 0) status = "Ready To Make";
    else if (missing.length === 1)
      status = "Missing 1 Ingredient";
    else if (missing.length <= 2)
      status = "Missing 1-2 Ingredients";

    return { ...recipe, status };
  });

  res.json(matched);
});

/* POST new recipe */
router.post("/", (req, res) => {
  const newRecipe = {
    id: Date.now().toString(),
    title: req.body.title,
    cuisine: req.body.cuisine,
    ingredients: req.body.ingredients,
    description: req.body.description,
    imageUrl:
      req.body.imageUrl ||
      "https://via.placeholder.com/400"
  };

  recipes.push(newRecipe);

  res.json(newRecipe);
});

/* PUT update */
router.put("/:id", (req, res) => {
  const index = recipes.findIndex(
    (r) => r.id === req.params.id
  );

  if (index === -1)
    return res.status(404).json({ error: "Not found" });

  recipes[index] = { ...recipes[index], ...req.body };

  res.json(recipes[index]);
});

/* DELETE */
router.delete("/:id", (req, res) => {
  const index = recipes.findIndex(
    (r) => r.id === req.params.id
  );

  if (index === -1)
    return res.status(404).json({ error: "Not found" });

  recipes.splice(index, 1);

  res.json({ message: "Deleted" });
});

export default router;