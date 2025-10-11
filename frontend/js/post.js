let currentUser = null;
let currentPost = null;
let postId = null;

// References to comment-related DOM elements
let commentForm = null;
let commentText = null;
let commentsList = null;

// Check if user is logged in and get post ID
window.addEventListener("DOMContentLoaded", async () => {
  const userStr = sessionStorage.getItem("user");

  if (!userStr) {
    window.location.href = "/login.html";
    return;
  }

  currentUser = JSON.parse(userStr);

  // Set user info in header
  document.getElementById("userNameDisplay").textContent = currentUser.name;
  document.getElementById("userAvatar").src =
    currentUser.profileImage ||
    `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${encodeURIComponent(currentUser.name)}`;

  const urlParams = new URLSearchParams(window.location.search);
  postId = urlParams.get("id");

  if (!postId) {
    showError("No post ID provided");
    return;
  }

  // Initialize event listeners
  setupEventListeners();

  // Capture comment form elements once the DOM has loaded
  commentForm = document.getElementById("commentForm");
  commentText = document.getElementById("commentText");
  commentsList = document.getElementById("commentsList");

  // Bind submit handler for new comments
  if (commentForm) {
    commentForm.addEventListener("submit", handleCommentSubmit);
  }

  // Load the post
  await loadPost();
});

function setupEventListeners() {
  // Back button
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "/dashboard.html";
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("user");
    window.location.href = "/";
  });

  document.getElementById("upvoteBtn").addEventListener("click", () => {
    // Trigger upvoting of the current post
    upvoteCurrentPost();
  });
}
// Load the post from server
async function loadPost() {
  try {
    const response = await fetch(`/api/posts/single?id=${postId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch post");
    }

    const data = await response.json();

    if (data.success && data.post) {
      currentPost = data.post;
      displayPost();
    } else {
      showError("Post not found");
    }
  } catch (error) {
    console.error("Error loading post:", error);
    showError("Failed to load post. Please try again.");
  }
}

// Display the post
function displayPost() {
  // Hide loading, show content
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("postContent").style.display = "block";

  // Set post data
  document.getElementById("postTitle").textContent = currentPost.title;
  document.getElementById("postDescription").textContent =
    currentPost.description;
  document.getElementById("postAuthor").textContent =
    currentPost.userEmail.split("@")[0];

  // Format date
  const postDate = new Date(currentPost.date);
  document.getElementById("postDate").textContent =
    postDate.toLocaleDateString();

  // Set vote count
  document.getElementById("voteCount").textContent = currentPost.votes || 0;

  // Toggle upvoted state on the post's upvote button based on whether
  // the current user's email is present in the post's voters array
  const upvoteBtn = document.getElementById("upvoteBtn");
  if (currentPost.voters && currentPost.voters.includes(currentUser.email)) {
    upvoteBtn.classList.add("upvoted");
  } else {
    upvoteBtn.classList.remove("upvoted");
  }

  // Render comments list whenever the post is displayed
  displayComments();
}

// Render the comments associated with the current post
function displayComments() {
  if (!commentsList) return;
  // Clear existing comments
  commentsList.innerHTML = "";
  const comments = currentPost && Array.isArray(currentPost.comments)
    ? currentPost.comments
    : [];
  if (!comments || comments.length === 0) {
    const li = document.createElement("li");
    li.className = "no-comments";
    li.textContent = "No comments yet.";
    commentsList.appendChild(li);
    return;
  }
  // Build a comment tree from the flat comments array.  Each comment
  // will have a children array containing its direct replies.
  const roots = buildCommentTree(comments);
  roots.forEach((root) => {
    // Pass depth parameter (0 for root) when rendering comments
    renderComment(root, commentsList, 0);
  });
}

/**
 * Construct a hierarchical tree of comments from a flat array. Each
 * comment must have a unique commentId and may have a parentId that
 * references the commentId of its parent. Top-level comments have
 * parentId equal to null. The returned list contains all root
 * comments with their children recursively attached.
 *
 * @param {Array} comments Array of comment objects from the server
 * @returns {Array} Array of root comments with children
 */
function buildCommentTree(comments) {
  const map = new Map();
  const roots = [];
  // Initialize the map with all comments and set up an empty children array
  comments.forEach((comment) => {
    // Ensure we work with a shallow copy to avoid mutating the original
    // objects, and convert commentId/parentId to strings for map keys.
    const cid = idToString(comment.commentId);
    const pid = comment.parentId ? idToString(comment.parentId) : null;
    map.set(cid, { ...comment, commentId: cid, parentId: pid, children: [] });
  });
  // Build the tree by linking children to their parents
  map.forEach((comment) => {
    if (!comment.parentId) {
      roots.push(comment);
    } else {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.children.push(comment);
      }
    }
  });
  return roots;
}

/**
 * Recursively render a comment and its children into the DOM. Each
 * comment is rendered inside an <li> element with the comment-item
 * class. Children comments are rendered below the parent inside
 * a nested <ul> with the replies-list class. A toggle button
 * collapses deep reply chains (depth >= 3) by default.
 *
 * @param {object} comment The comment object to render
 * @param {HTMLElement} container The DOM element (ul) to append this comment into
 * @param {number} depth The current depth of this comment in the thread
 */
function renderComment(comment, container, depth = 0) {
  const li = document.createElement("li");
  li.className = "comment-item";

  // Create a row container to hold upvote button and comment content
  const rowDiv = document.createElement("div");
  rowDiv.className = "comment-row";

  // Upvote button and vote count
  const upvoteBtn = document.createElement("button");
  upvoteBtn.className = "comment-upvote-btn";
  upvoteBtn.innerHTML = `<span class="comment-vote-icon">▲</span> <span class="comment-vote-count">${comment.votes || 0}</span>`;
  if (Array.isArray(comment.voters) && comment.voters.includes(currentUser.email)) {
    upvoteBtn.classList.add("upvoted");
  }
  upvoteBtn.addEventListener("click", () => {
    upvoteComment(comment.commentId);
  });

  // Comment content container
  const contentDiv = document.createElement("div");
  contentDiv.className = "comment-content";

  // Comment text
  const textDiv = document.createElement("div");
  textDiv.className = "comment-text";
  textDiv.textContent = comment.text;
  contentDiv.appendChild(textDiv);

  // Comment meta (author and date)
  const metaDiv = document.createElement("div");
  metaDiv.className = "comment-meta";
  const author = comment.userEmail ? comment.userEmail.split("@")[0] : "Anonymous";
  const date = new Date(comment.date);
  metaDiv.textContent = `${author} • ${date.toLocaleDateString()}`;
  contentDiv.appendChild(metaDiv);

  // Reply button
  const replyBtn = document.createElement("button");
  replyBtn.className = "comment-reply-btn";
  replyBtn.textContent = "Reply";
  contentDiv.appendChild(replyBtn);

  // Reply form (hidden by default)
  const replySection = document.createElement("div");
  replySection.className = "reply-section";
  replySection.style.display = "none";
  const replyTextarea = document.createElement("textarea");
  replyTextarea.className = "reply-textarea";
  replyTextarea.placeholder = "Write a reply...";
  const replySubmit = document.createElement("button");
  replySubmit.className = "btn-reply";
  replySubmit.textContent = "Post Reply";
  replySubmit.addEventListener("click", async () => {
    const text = replyTextarea.value.trim();
    if (!text) return;
    try {
      const resp = await fetch(`/api/posts/${postId}/comments/${comment.commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: currentUser.email, text }),
      });
      const resData = await resp.json();
      if (resData.success) {
        replyTextarea.value = "";
        replySection.style.display = "none";
        await loadPost();
      } else {
        alert(resData.message || "Failed to add reply");
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      alert("An error occurred while posting your reply.");
    }
  });
  replySection.appendChild(replyTextarea);
  replySection.appendChild(replySubmit);

  replyBtn.addEventListener("click", () => {
    replySection.style.display = replySection.style.display === "none" ? "block" : "none";
  });

  contentDiv.appendChild(replySection);

  // Assemble row
  rowDiv.appendChild(upvoteBtn);
  rowDiv.appendChild(contentDiv);
  li.appendChild(rowDiv);

  // Render children, if any
  if (comment.children && comment.children.length > 0) {
    // Create a container for replies
    const childList = document.createElement("ul");
    childList.className = "replies-list";
    // If depth >= 3, collapse the thread by default and show a toggle
    let collapsed = depth >= 3;
    if (collapsed) {
      childList.style.display = "none";
    }
    comment.children.forEach((child) => {
      renderComment(child, childList, depth + 1);
    });
    // Add toggle button to show/hide replies if deep chain
    if (depth >= 1) {
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "reply-toggle-btn";
      toggleBtn.textContent = collapsed
        ? `Show ${comment.children.length} repl${comment.children.length > 1 ? "ies" : "y"}`
        : "Hide replies";
      toggleBtn.addEventListener("click", () => {
        collapsed = !collapsed;
        childList.style.display = collapsed ? "none" : "block";
        toggleBtn.textContent = collapsed
          ? `Show ${comment.children.length} repl${comment.children.length > 1 ? "ies" : "y"}`
          : "Hide replies";
      });
      li.appendChild(toggleBtn);
    }
    li.appendChild(childList);
  }

  container.appendChild(li);
}

/**
 * Convert an ObjectId-like value into a string. MongoDB's driver
 * serializes ObjectId values as objects with a `$oid` key when
 * returning JSON. To build map keys correctly, we extract the
 * underlying string representation. If the input is already a
 * string, it is returned unchanged.
 *
 * @param {any} id The id value from the document
 * @returns {string} A string representation of the id
 */
function idToString(id) {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object" && "$oid" in id) return id.$oid;
  return id.toString();
}

// Handle new comment submission
async function handleCommentSubmit(event) {
  event.preventDefault();
  if (!commentText) return;
  const text = commentText.value.trim();
  if (!text) return;
  try {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: currentUser.email, text }),
    });
    const data = await response.json();
    if (data.success) {
      // Clear input and reload post data to show the new comment
      commentText.value = "";
      await loadPost();
    } else {
      console.error("Failed to add comment:", data.message || data.error);
      alert(data.message || "Failed to add comment");
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("An error occurred while adding your comment. Please try again.");
  }
}

// Upvote the current post
async function upvoteCurrentPost() {
  try {
    const response = await fetch(`/api/posts/${postId}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: currentUser.email }),
    });
    const data = await response.json();
    if (data.success) {
      // Reload the post to update vote count and button state
      await loadPost();
    } else {
      console.error("Failed to toggle post vote:", data.message || data.error);
      alert(data.message || "Failed to toggle post vote");
    }
  } catch (error) {
    console.error("Error toggling post vote:", error);
    alert("An error occurred while voting on the post. Please try again.");
  }
}

// Upvote a specific comment by its commentId
async function upvoteComment(commentId) {
  try {
    const response = await fetch(`/api/posts/${postId}/comments/${commentId}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: currentUser.email }),
    });
    const data = await response.json();
    if (data.success) {
      // Refresh the post to update comment vote counts and button states
      await loadPost();
    } else {
      console.error("Failed to toggle comment vote:", data.message || data.error);
      alert(data.message || "Failed to toggle comment vote");
    }
  } catch (error) {
    console.error("Error toggling comment vote:", error);
    alert("An error occurred while voting on the comment. Please try again.");
  }
}

// Show error message
function showError(message) {
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("postContent").style.display = "none";
  document.getElementById("errorMessage").style.display = "block";
  document.getElementById("errorMessage").textContent = message;
}
