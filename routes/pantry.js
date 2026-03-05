import express from "express";
import { getCollection, toObjectId, toPublicDoc } from "../db/myMongoDB.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const pantryCollection = await getCollection("pantry");
    const items = await pantryCollection
      .find({ userId: req.user._id.toString() })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(items.map(toPublicDoc));
  } catch (error) {
    console.error("Failed to fetch pantry items:", error);
    res.status(500).json({ error: "Failed to fetch pantry items" });
  }
});

router.post("/", async (req, res) => {
  try {
    const pantryCollection = await getCollection("pantry");

    if (!req.body.name) {
      return res.status(400).json({ error: "name is required" });
    }

    const item = {
      userId: req.user._id.toString(),
      name: String(req.body.name).trim(),
      quantity: req.body.quantity ? Number(req.body.quantity) : 1,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await pantryCollection.insertOne(item);
    //const created = await pantryCollection.findOne({ _id: result.insertedId });


    res.status(201).json(toPublicDoc({...item, _id: result.insertedId}));
  } catch (error) {
    console.error("Failed to create pantry item:", error);
    res.status(500).json({ error: "Failed to create pantry item" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const pantryCollection = await getCollection("pantry");
    const objectId = toObjectId(req.params.id);

    if (!objectId) return res.status(400).json({ error: "Invalid id" });

    const updateFields = {};

    if (req.body.name !== undefined) updateFields.name = String(req.body.name).trim();
    if (req.body.quantity !== undefined) updateFields.quantity = Number(req.body.quantity);
    if (req.body.expiresAt !== undefined) {
      updateFields.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
    }

    updateFields.updatedAt = new Date();

    const result = await pantryCollection.findOneAndUpdate(
      { _id: objectId, userId: req.user._id.toString() },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) return res.status(404).json({ error: "Not found" });

    res.json(toPublicDoc(result));
  } catch (error) {
    console.error("Failed to update pantry item:", error);
    res.status(500).json({ error: "Failed to update pantry item" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const pantryCollection = await getCollection("pantry");
    const objectId = toObjectId(req.params.id);

    if (!objectId) return res.status(400).json({ error: "Invalid id" });

    const result = await pantryCollection.deleteOne({
      _id: objectId,
      userId: req.user._id.toString(),
    });

    if (!result.deletedCount) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete pantry item:", error);
    res.status(500).json({ error: "Failed to delete pantry item" });
  }
});

export default router;
