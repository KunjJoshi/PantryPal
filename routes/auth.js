import express from "express";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getCollection } from "../db/myMongoDB.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const MIN_PASSWORD_LENGTH = 8;

const hashPassword = (password, salt) =>
  crypto.scryptSync(password, salt, 64).toString("hex");

const toDateOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const normalizeSeedRecipes = (rows, userId) =>
  rows.map((row, index) => {
    if (!row || typeof row !== "object") {
      throw new Error(`Invalid recipe at index ${index}`);
    }
    if (!row.title || !row.cuisine || !row.ingredients) {
      throw new Error(`Recipe missing required fields at index ${index}`);
    }

    const ingredients = Array.isArray(row.ingredients)
      ? row.ingredients.map((item) => String(item).trim()).filter(Boolean)
      : String(row.ingredients)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    return {
      userId,
      title: String(row.title).trim(),
      cuisine: String(row.cuisine).trim(),
      ingredients,
      description: row.description ? String(row.description).trim() : "",
      createdAt: toDateOrNull(row.createdAt) || new Date(),
      updatedAt: toDateOrNull(row.updatedAt) || new Date(),
    };
  });

const normalizeSeedPantry = (rows, userId) =>
  rows.map((row, index) => {
    if (!row || typeof row !== "object") {
      throw new Error(`Invalid pantry item at index ${index}`);
    }
    if (!row.name) {
      throw new Error(`Pantry item missing name at index ${index}`);
    }
    const quantity = Number(row.quantity);

    return {
      userId,
      name: String(row.name).trim(),
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      expiresAt: toDateOrNull(row.expiresAt),
      createdAt: toDateOrNull(row.createdAt) || new Date(),
      updatedAt: toDateOrNull(row.updatedAt) || new Date(),
    };
  });

const loadJsonArray = async (relativePath) => {
  const filePath = path.resolve(process.cwd(), relativePath);
  const content = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed)) {
    throw new Error(`${relativePath} must be a top-level array`);
  }
  return parsed;
};

const buildStarterData = async (userId) => {
  const [recipeRows, pantryRows] = await Promise.all([
    loadJsonArray("seeding_data/recipe.json"),
    loadJsonArray("seeding_data/ingredient.json"),
  ]);

  return {
    recipes: normalizeSeedRecipes(recipeRows, userId),
    pantry: normalizeSeedPantry(pantryRows, userId),
  };
};

router.post("/register", async (req, res) => {
  try {
    const usersCollection = await getCollection("users");
    const recipesCollection = await getCollection("recipes");
    const pantryCollection = await getCollection("pantry");
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ error: `password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const usernameLower = username.toLowerCase();
    const existingUser = await usersCollection.findOne({ usernameLower });
    if (existingUser) return res.status(409).json({ error: "username already exists" });

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();

    const userResult = await usersCollection.insertOne({
      username,
      usernameLower,
      passwordHash,
      salt,
      token,
      createdAt: now,
      updatedAt: now,
    });

    const userId = userResult.insertedId.toString();
    const starterData = await buildStarterData(userId);

    await Promise.all([
      starterData.recipes.length
        ? recipesCollection.insertMany(starterData.recipes)
        : Promise.resolve(),
      starterData.pantry.length
        ? pantryCollection.insertMany(starterData.pantry)
        : Promise.resolve(),
    ]);

    return res.status(201).json({ token, username, seeded: true });
  } catch (error) {
    console.error("Register failed:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const usersCollection = await getCollection("users");
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const user = await usersCollection.findOne({ usernameLower: username.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    const inputHash = hashPassword(password, user.salt);
    const hashMatch = crypto.timingSafeEqual(
      Buffer.from(inputHash, "hex"),
      Buffer.from(user.passwordHash, "hex")
    );

    if (!hashMatch) return res.status(401).json({ error: "Invalid username or password" });

    const token = crypto.randomBytes(32).toString("hex");
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { token, updatedAt: new Date() } }
    );

    return res.json({ token, username: user.username });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  try {
    const usersCollection = await getCollection("users");
    await usersCollection.updateOne({ _id: req.user._id }, { $set: { token: null } });
    return res.json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout failed:", error);
    return res.status(500).json({ error: "Failed to logout" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({
    id: req.user._id.toString(),
    username: req.user.username,
  });
});

export default router;
