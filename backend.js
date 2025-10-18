import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// routes
import authRoute from "./routes/authRoute.js";
import postsRoute from "./routes/postsRoute.js";

// Load environment variables
dotenv.config();

console.log("Initializing the backend...");

const PORT = process.env.PORT || 3000;

const app = express();

// Good use of essential middleware for CORS and body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serves frontend correctly; consider making path dynamic for flexibility
// Suggestion: use path.join(process.cwd(), "frontend") for safety
app.use(express.static("frontend"));

// Clean modular routing setup
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);

// Nice 404 handler for undefined API routes
// Improvement: Instead of sending JSON directly, call next(err) so centralized error middleware handles it
app.use(/^\/api\/.*$/, (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested API endpoint does not exist",
  });
});

// BUG: Error middleware must have FOUR arguments (err, req, res, next)
// Add `req` and `next` parameters so Express recognizes it properly
// Also consider adding helmet() and morgan() for security and logging
app.use((err, res) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    // Good use of conditional stack trace visibility
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Clear and simple server start
// In production, you could add error handling around listen()
app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});
