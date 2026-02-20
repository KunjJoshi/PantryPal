import express from "express";
import { getCollection, toObjectId, toPublicDoc } from "../db/myMongoDB.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const recipesCollection = await getCollection("recipes");
    const pantryCollection = await getCollection("pantry");
    const { cuisine, search } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 9));

    const query = {};

    if (cuisine) {
      query.cuisine = cuisine;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const [recipes, pantry] = await Promise.all([
      recipesCollection.find(query).sort({ createdAt: -1 }).toArray(),
      pantryCollection.find({}).toArray(),
    ]);

    const pantryNames = pantry.map((p) => p.name.toLowerCase());

    const matched = recipes.map((recipe) => {
      const safeIngredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [];
      const missing = safeIngredients.filter(
        (ing) => !pantryNames.includes(String(ing).toLowerCase())
      );

      let status = "Missing Several Ingredients";

      if (missing.length === 0) status = "Ready To Make";
      else if (missing.length <= 2) status = "Missing 1-2 Ingredients";

      return { ...toPublicDoc(recipe), status };
    });

    const totalItems = matched.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const items = matched.slice(start, start + limit);

    res.json({
      items,
      pagination: {
        page: safePage,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

/* POST new recipe */
router.post("/", async (req, res) => {
  try {
    const recipesCollection = await getCollection("recipes");

    if (!req.body.title || !req.body.cuisine || !req.body.ingredients) {
      return res.status(400).json({ error: "title, cuisine, ingredients are required" });
    }

    const ingredients = Array.isArray(req.body.ingredients)
      ? req.body.ingredients.map((i) => String(i).trim()).filter(Boolean)
      : String(req.body.ingredients)
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);

    const newRecipe = {
      title: String(req.body.title).trim(),
      cuisine: String(req.body.cuisine).trim(),
      ingredients,
      description: req.body.description ? String(req.body.description).trim() : "",
      imageUrl: req.body.imageUrl
        ? String(req.body.imageUrl).trim()
        : "https://via.placeholder.com/400",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await recipesCollection.insertOne(newRecipe);
    const created = await recipesCollection.findOne({ _id: result.insertedId });

    res.status(201).json(toPublicDoc(created));
  } catch (error) {
    console.error("Failed to create recipe:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

/* PUT update */
router.put("/:id", async (req, res) => {
  try {
    const recipesCollection = await getCollection("recipes");
    const objectId = toObjectId(req.params.id);

    if (!objectId) return res.status(400).json({ error: "Invalid id" });

    const updateFields = {};

    if (req.body.title !== undefined) updateFields.title = String(req.body.title).trim();
    if (req.body.cuisine !== undefined) updateFields.cuisine = String(req.body.cuisine).trim();
    if (req.body.description !== undefined) {
      updateFields.description = String(req.body.description).trim();
    }
    if (req.body.imageUrl !== undefined) updateFields.imageUrl = String(req.body.imageUrl).trim();
    if (req.body.ingredients !== undefined) {
      updateFields.ingredients = Array.isArray(req.body.ingredients)
        ? req.body.ingredients.map((i) => String(i).trim()).filter(Boolean)
        : String(req.body.ingredients)
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean);
    }

    updateFields.updatedAt = new Date();

    const result = await recipesCollection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ error: "Not found" });

    res.json(toPublicDoc(result));
  } catch (error) {
    console.error("Failed to update recipe:", error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

/* DELETE */
router.delete("/:id", async (req, res) => {
  try {
    const recipesCollection = await getCollection("recipes");
    const objectId = toObjectId(req.params.id);

    if (!objectId) return res.status(400).json({ error: "Invalid id" });

    const result = await recipesCollection.deleteOne({ _id: objectId });

    if (!result.deletedCount) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

export default router;
