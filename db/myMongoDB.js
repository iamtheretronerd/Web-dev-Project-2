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

    // Use environment variable if available, otherwise use default
    const URI = process.env.MONGODB_URI || defaultUri;

    // Connect function to create connection to MongoDB
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

    // Testing MongoDB connection by inserting and fetching a test document
    me.getTest = async () => {
        const { client, collection } = await connect();

        try {
            const testDoc = await collection.findOne({ type: "test" });
            if (!testDoc) {
                console.log("No test document found, creating one...");
                await collection.insertOne({
                    type: "test",
                    message: "Hello from MongoDB!",
                    timestamp: new Date()
                });
                const newDoc = await collection.findOne({ type: "test" });
                return newDoc;
            }

            console.log("Fetched test document from MongoDB");
            return testDoc;
        } catch (err) {
            console.error("Error fetching test from MongoDB:", err);
            throw err;
        } finally {
            await client.close();
            console.log("MongoDB connection closed");
        }
    };

    // Get all documents from collection 
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


    // Insert a new document
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

    // Update a document
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

    // Delete a document
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

    return me;
}

// Export as default
export default MyMongoDB;