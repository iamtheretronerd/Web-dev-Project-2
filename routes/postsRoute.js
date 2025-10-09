import express from "express";
import {
  createPost,
  getPostsPaginated,
  getUserPosts,
  searchPosts,
} from "../db/postsDB.js";

const router = express.Router();

// Create a new post - POST /api/posts
router.post("/", async (req, res) => {
  try {
    const { title, description, userEmail } = req.body;

    if (!title || !description || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and user email are required",
      });
    }

    const result = await createPost({
      title,
      description,
      userEmail,
    });

    res.json({
      success: true,
      message: "Post created successfully",
      postId: result.insertedId,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
});

// Get all posts with pagination - GET /api/posts?page=1
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await getPostsPaginated(page);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
});

// Get user's posts - GET /api/posts/my-posts?page=1&userEmail=
router.get("/my-posts", async (req, res) => {
  try {
    const { userEmail, page = 1 } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    const result = await getUserPosts(userEmail, parseInt(page));

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user posts",
      error: error.message,
    });
  }
});

// Search posts - GET /api/posts/search?q=...
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "query is required",
      });
    }

    const posts = await searchPosts(q);

    res.json({
      success: true,
      posts,
      totalCount: posts.length,
    });
  } catch (error) {
    console.error("Search posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search posts",
      error: error.message,
    });
  }
});

export default router;
