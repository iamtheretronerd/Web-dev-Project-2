import express from "express";
import cors from "cors";
import dotenv from "dotenv";

//routes
import authRoute from "./routes/authRoute.js";
import postsRoute from "./routes/postsRoute.js";

// Load environment variables
dotenv.config();

console.log("Initializing the backend...");

const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static("frontend"));

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);

// 404 handler for API routes
app.use(/^\/api\/.*$/, (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested API endpoint does not exist",
  });
});

// Error handling middleware (must include 4 args for Express to use it)
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});
