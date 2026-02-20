import { getCollection } from "../db/myMongoDB.js";

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;
  const [scheme, token] = String(authorizationHeader).split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) return res.status(401).json({ error: "Authentication required" });

    const usersCollection = await getCollection("users");
    const user = await usersCollection.findOne({ token });

    if (!user) return res.status(401).json({ error: "Invalid session" });

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth middleware failed:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
};

export { requireAuth };
