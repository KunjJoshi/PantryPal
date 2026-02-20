import "../config/loadEnv.js";
import fs from "fs/promises";
import path from "path";
import { getCollection, closeConnection } from "../db/myMongoDB.js";

const readJsonArray = async (fileName) => {
  const filePath = path.resolve(process.cwd(), fileName);
  const fileContent = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(fileContent);

  if (!Array.isArray(parsed)) {
    throw new Error(`${fileName} must contain a top-level JSON array.`);
  }

  return parsed;
};

const toDateOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const normalizeRecipes = (rows) => {
  return rows.map((row, index) => {
    if (!row || typeof row !== "object") {
      throw new Error(`Invalid recipe at index ${index}: must be an object.`);
    }
    if (!row.title || !row.cuisine || !row.ingredients) {
      throw new Error(
        `Invalid recipe at index ${index}: title, cuisine, and ingredients are required.`
      );
    }
    const ingredients = Array.isArray(row.ingredients)
      ? row.ingredients.map((item) => String(item).trim()).filter(Boolean)
      : String(row.ingredients)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    return {
      title: String(row.title).trim(),
      cuisine: String(row.cuisine).trim(),
      ingredients,
      description: row.description ? String(row.description).trim() : "",
      createdAt: toDateOrNull(row.createdAt) || new Date(),
      updatedAt: toDateOrNull(row.updatedAt) || new Date(),
    };
  });
};

const normalizePantry = (rows) => {
  return rows.map((row, index) => {
    if (!row || typeof row !== "object") {
      throw new Error(`Invalid pantry item at index ${index}: must be an object.`);
    }
    if (!row.name) {
      throw new Error(`Invalid pantry item at index ${index}: name is required.`);
    }

    const quantity = Number(row.quantity);

    return {
      name: String(row.name).trim(),
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      expiresAt: toDateOrNull(row.expiresAt),
      createdAt: toDateOrNull(row.createdAt) || new Date(),
      updatedAt: toDateOrNull(row.updatedAt) || new Date(),
    };
  });
};

const run = async () => {
  try {
    const recipesCollection = await getCollection("recipes");
    const pantryCollection = await getCollection("pantry");

    await Promise.all([
      recipesCollection.deleteMany({}),
      pantryCollection.deleteMany({}),
    ]);

    const [recipeRows, pantryRows] = await Promise.all([
      readJsonArray("seeding_data/recipe.json"),
      readJsonArray("seeding_data/ingredient.json"),
    ]);

    const recipes = normalizeRecipes(recipeRows);
    const pantrySeed = normalizePantry(pantryRows);

    await Promise.all([
      recipesCollection.insertMany(recipes),
      pantryCollection.insertMany(pantrySeed),
    ]);

    console.log("Seed complete:");
    console.log("- recipes:", recipes.length);
    console.log("- pantry:", pantrySeed.length);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await closeConnection();
  }
};

run();
