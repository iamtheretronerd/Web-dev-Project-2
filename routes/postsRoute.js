import express from "express";
import {
  createPost,
  getPostsPaginated,
  getUserPosts,
  searchPosts,
  getPostById,
  addCommentToPost,
  togglePostVote,
  toggleCommentVote,
  addReplyToComment,
  deletePost,
  updatePost,
  getTopRatedPosts,
  getTotalPostCount,
} from "../db/postsDB.js";

const router = express.Router();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

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

// Generate AI suggestion for a post - GET /api/posts/:id/ai-suggestion
router.get("/:id/ai-suggestion", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the post with comments
    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Prepare context for AI
    const commentsSummary =
      post.comments && post.comments.length > 0
        ? post.comments.map((c) => c.text).join("\n")
        : "No comments yet";

    const prompt = `You are an innovation consultant analyzing a project idea and its critiques.

      Project Title: ${post.title}
      Project Description: ${post.description}

      Community Feedback and Critiques:
      ${commentsSummary}

      Based on the original idea and the community's devil's advocate critiques, suggest ONE specific, actionable improvement or pivot for this project. Keep your suggestion concise (2-3 sentences) and practical. Focus on addressing the main concerns raised while preserving the core value of the original idea. If there is no enough information or critiques, suggest a general improvement.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const suggestion = response.text;

    res.json({
      success: true,
      suggestion: suggestion.trim(),
    });
  } catch (error) {
    console.error("AI suggestion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI suggestion",
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

// Get total count of posts - GET /api/posts/count
router.get("/count", async (req, res) => {
  try {
    const count = await getTotalPostCount();

    res.json({
      success: true,
      count: count,
      message: `Total posts in database: ${count}`,
    });
  } catch (error) {
    console.error("Get post count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch post count",
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

// Get single post - GET /api/posts/single?id=...
router.get("/single", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Get single post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
      error: error.message,
    });
  }
});

// Toggle upvote on a post - POST /api/posts/:id/upvote
router.post("/:id/upvote", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }
    if (!userEmail) {
      return res
        .status(400)
        .json({ success: false, message: "User email is required" });
    }
    const result = await togglePostVote(id, userEmail);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.json({
      success: true,
      upvoted: result.upvoted,
      message: result.upvoted
        ? "Post upvoted successfully"
        : "Post vote removed",
    });
  } catch (error) {
    console.error("Toggle post upvote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle vote",
      error: error.message,
    });
  }
});

// Add a comment to a post - POST /api/posts/:postId/comments
router.post("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userEmail, text } = req.body;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }
    if (!userEmail || !text) {
      return res
        .status(400)
        .json({ success: false, message: "User email and text are required" });
    }
    const result = await addCommentToPost(postId, { userEmail, text });
    if (!result || result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, message: "Comment added successfully" });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
});

// Toggle upvote on a comment - POST /api/posts/:postId/comments/:commentId/upvote
router.post("/:postId/comments/:commentId/upvote", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userEmail } = req.body;
    if (!postId || !commentId) {
      return res.status(400).json({
        success: false,
        message: "Post ID and comment ID are required",
      });
    }
    if (!userEmail) {
      return res
        .status(400)
        .json({ success: false, message: "User email is required" });
    }
    const result = await toggleCommentVote(postId, commentId, userEmail);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }
    res.json({
      success: true,
      upvoted: result.upvoted,
      message: result.upvoted
        ? "Comment upvoted successfully"
        : "Comment vote removed",
    });
  } catch (error) {
    console.error("Toggle comment upvote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle comment vote",
      error: error.message,
    });
  }
});

// Add a reply to a comment - POST /api/posts/:postId/comments/:commentId/replies
router.post("/:postId/comments/:commentId/replies", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userEmail, text } = req.body;
    if (!postId || !commentId) {
      return res.status(400).json({
        success: false,
        message: "Post ID and comment ID are required",
      });
    }
    if (!userEmail || !text) {
      return res
        .status(400)
        .json({ success: false, message: "User email and text are required" });
    }
    const result = await addReplyToComment(postId, commentId, {
      userEmail,
      text,
    });
    if (!result || result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Post or comment not found" });
    }
    return res.json({ success: true, message: "Reply added successfully" });
  } catch (error) {
    console.error("Add reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reply",
      error: error.message,
    });
  }
});

// Update a post - PUT /api/posts/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, userEmail } = req.body;

    if (!title || !description || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and user email are required",
      });
    }

    const result = await updatePost(id, userEmail, { title, description });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you don't have permission to edit",
      });
    }

    res.json({
      success: true,
      message: "Post updated successfully",
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update post",
      error: error.message,
    });
  }
});

// Delete a post - DELETE /api/posts/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    const result = await deletePost(id, userEmail);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you don't have permission to delete",
      });
    }

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: error.message,
    });
  }
});

// Get top-rated posts - GET /api/posts/top-rated?page=1
router.get("/top-rated", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await getTopRatedPosts(page);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get top rated posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top rated posts",
      error: error.message,
    });
  }
});

export default router;
