import express from "express";
import MyMongoDB from "../db/myMongoDB.js";

const router = express.Router();

// Initialize MongoDB
const mongodb = MyMongoDB({
  dbName: "testDatabase",
  collectionName: "testCollection",
});

// Test route - GET /api/test
router.get("/", async (req, res) => {
  try {
    const testData = await mongodb.getTest();
    res.json({
      test: "ok",
      data: testData,
    });
  } catch (error) {
    res.status(500).json({
      test: "error",
      message: error.message,
    });
  }
});

export default router;
