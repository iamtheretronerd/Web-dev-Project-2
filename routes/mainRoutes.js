import express from "express";

const router = express.Router();

// Test route - GET /api/test
router.get("/test", (req, res) => {
  res.json({ test: "ok" });
});

export default router;