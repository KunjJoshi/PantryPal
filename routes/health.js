import express from "express";
import { getCollection } from "../db/myMongoDB.js";

const router = express.Router();

const MAX_HEARTS = 5;

router.get("/", async (req, res) => {
  try {
    const pantryCollection = await getCollection("pantry");
    const pantry = await pantryCollection.find({}).toArray();
    const ingredientCount = pantry.length;
    const hearts = Math.max(0, Math.min(MAX_HEARTS, ingredientCount));
    const scorePercent = Math.round((hearts / MAX_HEARTS) * 100);

    res.json({
      hearts,
      maxHearts: MAX_HEARTS,
      scorePercent,
      pantryItems: ingredientCount,
    });
  } catch (error) {
    console.error("Failed to compute pantry health:", error);
    res.status(500).json({ error: "Failed to compute pantry health" });
  }
});

export default router;
