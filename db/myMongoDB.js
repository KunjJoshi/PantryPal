import { MongoClient } from "mongodb";

function MyMongoDB({
  dbName = "pantryPal",
  collectionName = "recipes",
  defaultUri,
} = {}) {
  const me = {};
  const mongoHost = process.env.MONGODB_HOST;
  const mongoPort = process.env.MONGODB_PORT || "27017";
  const mongoUser = process.env.MONGODB_USER;
  const mongoPass = process.env.MONGODB_PASSWORD;
  const mongoAuthSource = process.env.MONGODB_AUTH_SOURCE || "admin";

  const fallbackUri =
    defaultUri ||
    (mongoHost && mongoUser && mongoPass
      ? `mongodb://${encodeURIComponent(mongoUser)}:${encodeURIComponent(
          mongoPass
        )}@${mongoHost}:${mongoPort}/${dbName}?authSource=${mongoAuthSource}`
      : null);

  const URI = process.env.MONGODB_URI || fallbackUri;

  if (!URI) {
    throw new Error(
      "Missing MongoDB config. Set MONGODB_URI or set MONGODB_HOST, MONGODB_USER, and MONGODB_PASSWORD in .env."
    );
  }

  const connect = async () => {
    console.log("Connecting to MongoDB at URI:", URI);
    const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const collection = client.db(dbName).collection(collectionName);
    return { client, collection };
  };

  me.getListings = async (query = {}, pageSize = 20, page = 0) => {
    const { client, collection } = await connect();

    try {
      const data = await collection
        .find(query)
        .limit(pageSize)
        .skip(page * pageSize)
        .toArray();
      console.log(`Fetched ${collectionName} from MongoDB:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      throw error;
    } finally {
      await client.close();
    }
  };

  return me;
}

const myMongoDB = MyMongoDB(); // Singleton instance for the app
export default myMongoDB;
