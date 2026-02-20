import express from "express";
import { getCollection } from "../db/myMongoDB.js";

const router = express.Router();

const MAX_HEARTS = 5;

router.get("/", async (req, res) => {
  try {
    const recipesCollection = await getCollection("recipes");
    const pantryCollection = await getCollection("pantry");

    const [recipes, pantry] = await Promise.all([
      recipesCollection.find({}).toArray(),
      pantryCollection.find({}).toArray(),
    ]);

    const pantryNames = new Set(
      pantry.map((item) => String(item.name || "").trim().toLowerCase())
    );

    let readyCount = 0;
    let nearReadyCount = 0;

    recipes.forEach((recipe) => {
      const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [];

      const missingCount = ingredients.filter(
        (ingredient) => !pantryNames.has(String(ingredient).trim().toLowerCase())
      ).length;

      if (missingCount === 0) readyCount += 1;
      if (missingCount <= 2) nearReadyCount += 1;
    });

    const totalRecipes = recipes.length;
    const weightedScore =
      totalRecipes > 0
        ? (readyCount + (nearReadyCount - readyCount) * 0.5) / totalRecipes
        : 0;

    const hearts = Math.max(
      0,
      Math.min(MAX_HEARTS, Math.round(weightedScore * MAX_HEARTS))
    );

    res.json({
      hearts,
      maxHearts: MAX_HEARTS,
      scorePercent: Math.round(weightedScore * 100),
      totalRecipes,
      readyRecipes: readyCount,
      nearReadyRecipes: nearReadyCount,
      pantryItems: pantry.length,
    });
  } catch (error) {
    console.error("Failed to compute pantry health:", error);
    res.status(500).json({ error: "Failed to compute pantry health" });
  }
});

export default router;
