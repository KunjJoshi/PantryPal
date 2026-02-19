import express from "express";
import recipesRoutes from "./routes/recipes.js";
import pantryRoutes from "./routes/pantry.js";
import path from "path";
import { fileURLToPath } from "url";

console.log("Initializing backend...");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static("frontend"));

app.use("/api/recipes", recipesRoutes);
app.use("/api/pantry", pantryRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
