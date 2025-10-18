import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

function MyMongoDB({
  dbName = "testDatabase",
  collectionName = "testCollection",
  defaultUri = "mongodb://localhost:27017",
} = {}) {
  const me = {};

  // Good use of defaults for flexibility across environments
  const URI = process.env.MONGODB_URI || defaultUri;

  // --- Connection Function ---
  const connect = async () => {
    console.log("Connecting to MongoDB at", URI.slice(0, 20));

    try {
      const client = new MongoClient(URI);
      await client.connect();
      console.log("Successfully connected to MongoDB");

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      return { client, db, collection };
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  };
  // Pros:
  // - Each operation creates an isolated connection and closes it properly.
  // - Reduces accidental connection leaks.
  // Cons:
  // - Inefficient for frequent operations since it reconnects every call.
  //   Consider caching MongoClient or connecting once at startup for performance.

  // --- Get all documents ---
  me.getDocuments = async (query = {}) => {
    const { client, collection } = await connect();

    try {
      const data = await collection.find(query).toArray();
      console.log(`Fetched ${data.length} documents from MongoDB`);
      return data;
    } catch (err) {
      console.error("Error fetching documents from MongoDB:", err);
      throw err;
    } finally {
      await client.close();
    }
  };
  // Clear and simple implementation.
  // Suggestion: Add optional parameters for pagination (limit, skip, sort).

  // --- Insert a document ---
  me.insertDocument = async (document) => {
    const { client, collection } = await connect();

    try {
      const result = await collection.insertOne(document);
      console.log("Document inserted with _id:", result.insertedId);
      return result;
    } catch (err) {
      console.error("Error inserting document:", err);
      throw err;
    } finally {
      await client.close();
    }
  };
  // Clean insert logic.
  // Suggestion: Validate document fields before inserting (e.g., with Joi or Zod).

  // --- Update a document ---
  me.updateDocument = async (filter, update) => {
    const { client, collection } = await connect();

    try {
      const result = await collection.updateOne(filter, { $set: update });
      console.log(`${result.modifiedCount} document(s) updated`);
      return result;
    } catch (err) {
      console.error("Error updating document:", err);
      throw err;
    } finally {
      await client.close();
    }
  };
  // Well structured.
  // Suggestion: Consider supporting updateMany or other Mongo operators like $inc, $push.

  // --- Delete a document ---
  me.deleteDocument = async (filter) => {
    const { client, collection } = await connect();

    try {
      const result = await collection.deleteOne(filter);
      console.log(`${result.deletedCount} document(s) deleted`);
      return result;
    } catch (err) {
      console.error("Error deleting document:", err);
      throw err;
    } finally {
      await client.close();
    }
  };
  // Straightforward deletion logic.
  // Suggestion: Support deleteMany or implement a soft-delete option by setting deletedAt.

  // --- Find one document ---
  me.findOne = async (filter) => {
    const { client, collection } = await connect();

    try {
      const document = await collection.findOne(filter);
      console.log("Found document:", document ? "Yes" : "No");
      return document;
    } catch (err) {
      console.error("Error finding document:", err);
      throw err;
    } finally {
      await client.close();
    }
  };
  // Robust single-document lookup.
  // Suggestion: Add support for projections (selecting specific fields).

  me.connect = connect;
  // Exposing connect() gives flexibility for manual connection handling.

  return me;
}

// Export as default
export default MyMongoDB;
