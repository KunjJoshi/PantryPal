import express from "express";
import { pantry } from "../data/store.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(pantry);
});


export default router;