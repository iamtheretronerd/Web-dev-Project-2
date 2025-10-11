import express from "express";
import {
  createPost,
  getPostsPaginated,
  getUserPosts,
  searchPosts,
  getPostById,
  upvotePost,
  addCommentToPost,
  upvoteComment,
  togglePostVote,
  toggleCommentVote,
  addReplyToComment,
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
// Requires the user's email in the request body.  If the user has
// previously upvoted the post, their vote is removed; otherwise it is added.
router.post("/:id/upvote", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Post ID is required" });
    }
    if (!userEmail) {
      return res.status(400).json({ success: false, message: "User email is required" });
    }
    const result = await togglePostVote(id, userEmail);
    if (!result) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({
      success: true,
      upvoted: result.upvoted,
      message: result.upvoted ? "Post upvoted successfully" : "Post vote removed",
    });
  } catch (error) {
    console.error("Toggle post upvote error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle vote", error: error.message });
  }
});

// Add a comment to a post - POST /api/posts/:postId/comments
router.post("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userEmail, text } = req.body;
    if (!postId) {
      return res.status(400).json({ success: false, message: "Post ID is required" });
    }
    if (!userEmail || !text) {
      return res.status(400).json({ success: false, message: "User email and text are required" });
    }
    const result = await addCommentToPost(postId, { userEmail, text });
    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, message: "Comment added successfully" });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Failed to add comment", error: error.message });
  }
});

// Toggle upvote on a comment - POST /api/posts/:postId/comments/:commentId/upvote
// Requires the user's email in the request body.  If the user has
// previously upvoted the comment, their vote is removed, otherwise it is added.
router.post("/:postId/comments/:commentId/upvote", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userEmail } = req.body;
    if (!postId || !commentId) {
      return res.status(400).json({ success: false, message: "Post ID and comment ID are required" });
    }
    if (!userEmail) {
      return res.status(400).json({ success: false, message: "User email is required" });
    }
    const result = await toggleCommentVote(postId, commentId, userEmail);
    if (!result) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    res.json({
      success: true,
      upvoted: result.upvoted,
      message: result.upvoted ? "Comment upvoted successfully" : "Comment vote removed",
    });
  } catch (error) {
    console.error("Toggle comment upvote error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle comment vote", error: error.message });
  }
});

// Add a reply to a comment - POST /api/posts/:postId/comments/:commentId/replies
// Requires the user's email and reply text in the request body.
router.post("/:postId/comments/:commentId/replies", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userEmail, text } = req.body;
    if (!postId || !commentId) {
      return res.status(400).json({ success: false, message: "Post ID and comment ID are required" });
    }
    if (!userEmail || !text) {
      return res.status(400).json({ success: false, message: "User email and text are required" });
    }
    const result = await addReplyToComment(postId, commentId, { userEmail, text });
    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Post or comment not found" });
    }
    return res.json({ success: true, message: "Reply added successfully" });
  } catch (error) {
    console.error("Add reply error:", error);
    res.status(500).json({ success: false, message: "Failed to add reply", error: error.message });
  }
});

export default router;
