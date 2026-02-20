import express from "express";
import { getCollection, toObjectId, toPublicDoc } from "../db/myMongoDB.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

const toTitleCase = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());

const normalizeIngredients = (ingredients) =>
  (Array.isArray(ingredients)
    ? ingredients
    : String(ingredients)
        .split(",")
        .map((i) => i.trim())
  )
    .map((i) => toTitleCase(i))
    .filter(Boolean);

router.get("/", async (req, res) => {
  try {
    const recipesCollection = await getCollection("recipes");
    const pantryCollection = await getCollection("pantry");
    const { cuisine, search } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 9));

    const query = {};
    query.userId = req.user._id.toString();

    if (cuisine) {
      query.cuisine = cuisine;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const [recipes, pantry] = await Promise.all([
      recipesCollection.find(query).sort({ createdAt: -1 }).toArray(),
      pantryCollection.find({ userId: req.user._id.toString() }).toArray(),
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

    const statusOrder = {
      "Ready To Make": 0,
      "Missing 1-2 Ingredients": 1,
      "Missing Several Ingredients": 2,
    };

    matched.sort((a, b) => {
      const aRank = statusOrder[a.status] ?? 99;
      const bRank = statusOrder[b.status] ?? 99;
      if (aRank !== bRank) return aRank - bRank;
      return String(a.title || "").localeCompare(String(b.title || ""), "en", {
        sensitivity: "base",
      });
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

    const ingredients = normalizeIngredients(req.body.ingredients);

    const newRecipe = {
      userId: req.user._id.toString(),
      title: toTitleCase(req.body.title),
      cuisine: String(req.body.cuisine).trim(),
      ingredients,
      description: req.body.description ? String(req.body.description).trim() : "",
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

    if (req.body.title !== undefined) updateFields.title = toTitleCase(req.body.title);
    if (req.body.cuisine !== undefined) updateFields.cuisine = String(req.body.cuisine).trim();
    if (req.body.description !== undefined) {
      updateFields.description = String(req.body.description).trim();
    }
    if (req.body.ingredients !== undefined) {
      updateFields.ingredients = normalizeIngredients(req.body.ingredients);
    }

    updateFields.updatedAt = new Date();

    const result = await recipesCollection.findOneAndUpdate(
      { _id: objectId, userId: req.user._id.toString() },
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

    const result = await recipesCollection.deleteOne({
      _id: objectId,
      userId: req.user._id.toString(),
    });

    if (!result.deletedCount) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

export default router;
