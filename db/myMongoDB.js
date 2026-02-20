import "../config/loadEnv.js";
import { MongoClient, ObjectId } from "mongodb";

const mongoHost = process.env.MONGODB_HOST;
const mongoPort = process.env.MONGODB_PORT || "27017";
const mongoUser = process.env.MONGODB_USER;
const mongoPass = process.env.MONGODB_PASSWORD;
const mongoAuthSource = process.env.MONGODB_AUTH_SOURCE || "admin";
const dbName = process.env.MONGODB_DB_NAME || process.env.DB_NAME || "pantryPal";

const fallbackUri =
  mongoHost && mongoUser && mongoPass
    ? `mongodb://${encodeURIComponent(mongoUser)}:${encodeURIComponent(
        mongoPass
      )}@${mongoHost}:${mongoPort}/${dbName}?authSource=${mongoAuthSource}`
    : null;

const URI = process.env.MONGODB_URI || process.env.MONGO_URI || fallbackUri;

if (!URI) {
  throw new Error(
    "Missing MongoDB config. Set MONGODB_URI/MONGO_URI or set MONGODB_HOST, MONGODB_USER, and MONGODB_PASSWORD in .env."
  );
}

let client;
let db;

const getDb = async () => {
  if (db) return db;

  client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  db = client.db(dbName);
  return db;
};

const getCollection = async (collectionName) => {
  const activeDb = await getDb();
  return activeDb.collection(collectionName);
};

const toPublicDoc = (doc) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
};

const toObjectId = (id) => {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
};

const closeConnection = async () => {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
};

export { getCollection, toPublicDoc, toObjectId, closeConnection };
