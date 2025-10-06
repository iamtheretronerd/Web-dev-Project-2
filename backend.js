import express from "express";
import cors from "cors";
import dotenv from "dotenv";

//routes
import mainRoutes from "./routes/mainRoutes.js";

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
app.use("/api/", mainRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for API routes
app.use(/^\/api\/.*$/, (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested API endpoint does not exist",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Server is running on Port: ${PORT} and health endpoint at /api/health`,
  );
});
