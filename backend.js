import "./config/loadEnv.js";
import express from "express";
import recipesRoutes from "./routes/recipes.js";
import pantryRoutes from "./routes/pantry.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";

console.log("Initializing backend...");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("frontend"));

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/health", healthRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
