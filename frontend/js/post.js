let currentUser = null;
let currentPost = null;
let postId = null;

let commentForm = null;
let commentText = null;
let commentsList = null;

// Clean state variable initialization.
// Suggestion: group into an object for easier state management (e.g. `appState = { currentUser, currentPost, ... }`)

// Check if user is logged in and get post ID
window.addEventListener("DOMContentLoaded", async () => {
  const userStr = sessionStorage.getItem("user");

  // Good early redirect for unauthenticated users.
  if (!userStr) {
    window.location.href = "/login.html";
    return;
  }

  currentUser = JSON.parse(userStr);

  // Nicely displays user info with fallback avatar.
  document.getElementById("userNameDisplay").textContent = currentUser.name;
  document.getElementById("userAvatar").src =
    currentUser.profileImage ||
    `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${encodeURIComponent(currentUser.name)}`;

  const urlParams = new URLSearchParams(window.location.search);
  postId = urlParams.get("id");

  // Good defensive check for missing post ID.
  if (!postId) {
    showError("No post ID provided");
    return;
  }

  // Initialization
  setupEventListeners();

  // Grabs DOM references only after DOMContentLoaded — excellent.
  commentForm = document.getElementById("commentForm");
  commentText = document.getElementById("commentText");
  commentsList = document.getElementById("commentsList");

  // Attaches submit listener safely.
  if (commentForm) {
    commentForm.addEventListener("submit", handleCommentSubmit);
  }

  // Loads main post content.
  await loadPost();
});

// Fetches AI suggestions for a post.
async function loadAISuggestion() {
  try {
    const response = await fetch(`/api/posts/${postId}/ai-suggestion`);
    const data = await response.json();

    // Graceful fallback when AI suggestion isn’t available.
    if (data.success && data.suggestion) {
      document.getElementById("aiSuggestion").innerHTML = data.suggestion;
    } else {
      document.getElementById("aiSuggestion").innerHTML =
        '<span class="ai-error">Unable to generate suggestion at this time.</span>';
    }
  } catch (error) {
    console.error("Error loading AI suggestion:", error);
    document.getElementById("aiSuggestion").innerHTML =
      '<span class="ai-error">AI Genie is currently unavailable.</span>';
  }
}

// Initializes event listeners for navigation and voting.
function setupEventListeners() {
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "/dashboard.html";
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("user");
    window.location.href = "/";
  });

  document.getElementById("upvoteBtn").addEventListener("click", () => {
    upvoteCurrentPost();
  });
}

// Loads post and related comments.
async function loadPost() {
  try {
    const response = await fetch(`/api/posts/single?id=${postId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch post");
    }

    const data = await response.json();

    // Good success check and fallback.
    if (data.success && data.post) {
      currentPost = data.post;
      displayPost();
      loadAISuggestion();
    } else {
      showError("Post not found");
    }
  } catch (error) {
    console.error("Error loading post:", error);
    showError("Failed to load post. Please try again.");
  }
}

// Renders post details.
function displayPost() {
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("postContent").style.display = "block";

  // Solid DOM updates and date formatting.
  document.getElementById("postTitle").textContent = currentPost.title;
  document.getElementById("postDescription").textContent =
    currentPost.description;
  document.getElementById("postAuthor").textContent =
    currentPost.userEmail.split("@")[0];

  const postDate = new Date(currentPost.date);
  document.getElementById("postDate").textContent =
    postDate.toLocaleDateString();

  document.getElementById("voteCount").textContent = currentPost.votes || 0;

  // Upvote button state toggle works well.
  const upvoteBtn = document.getElementById("upvoteBtn");
  if (currentPost.voters && currentPost.voters.includes(currentUser.email)) {
    upvoteBtn.classList.add("upvoted");
  } else {
    upvoteBtn.classList.remove("upvoted");
  }

  // Loads comments dynamically.
  displayComments();
}

// Nicely modularized comments rendering.
function displayComments() {
  if (!commentsList) return;
  commentsList.innerHTML = "";
  const comments =
    currentPost && Array.isArray(currentPost.comments)
      ? currentPost.comments
      : [];
  if (!comments || comments.length === 0) {
    const li = document.createElement("li");
    li.className = "no-comments";
    li.textContent = "No comments yet.";
    commentsList.appendChild(li);
    return;
  }
  const roots = buildCommentTree(comments);
  roots.forEach((root) => {
    renderComment(root, commentsList, 0);
  });
}

// Builds a hierarchical comment tree — efficient approach.
function buildCommentTree(comments) {
  const map = new Map();
  const roots = [];
  comments.forEach((comment) => {
    const cid = idToString(comment.commentId);
    const pid = comment.parentId ? idToString(comment.parentId) : null;
    map.set(cid, { ...comment, commentId: cid, parentId: pid, children: [] });
  });
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

// Renders a single comment recursively.
// Great modularization and recursion logic.
function renderComment(comment, container, depth = 0) {
  const li = document.createElement("li");
  li.className = "comment-item";

  const rowDiv = document.createElement("div");
  rowDiv.className = "comment-row";

  // Upvote logic — good UX, but you might debounce rapid clicks to prevent spam.
  const upvoteBtn = document.createElement("button");
  upvoteBtn.className = "comment-upvote-btn";
  upvoteBtn.innerHTML = `<span class="comment-vote-icon">▲</span> <span class="comment-vote-count">${comment.votes || 0}</span>`;
  if (
    Array.isArray(comment.voters) &&
    comment.voters.includes(currentUser.email)
  ) {
    upvoteBtn.classList.add("upvoted");
  }
  upvoteBtn.addEventListener("click", () => {
    upvoteComment(comment.commentId);
  });

  // Clean comment meta and content handling.
  const contentDiv = document.createElement("div");
  contentDiv.className = "comment-content";
  const textDiv = document.createElement("div");
  textDiv.className = "comment-text";
  textDiv.textContent = comment.text;
  contentDiv.appendChild(textDiv);

  const metaDiv = document.createElement("div");
  metaDiv.className = "comment-meta";
  const author = comment.userEmail
    ? comment.userEmail.split("@")[0]
    : "Anonymous";
  const date = new Date(comment.date);
  metaDiv.textContent = `${author} • ${date.toLocaleDateString()}`;
  contentDiv.appendChild(metaDiv);

  // Reply UI and handler work well.
  const replyBtn = document.createElement("button");
  replyBtn.className = "comment-reply-btn";
  replyBtn.textContent = "Reply";
  contentDiv.appendChild(replyBtn);

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
      const resp = await fetch(
        `/api/posts/${postId}/comments/${comment.commentId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: currentUser.email, text }),
        },
      );
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
    replySection.style.display =
      replySection.style.display === "none" ? "block" : "none";
  });

  contentDiv.appendChild(replySection);

  rowDiv.appendChild(upvoteBtn);
  rowDiv.appendChild(contentDiv);
  li.appendChild(rowDiv);

  // Collapsible nested replies are well-implemented.
  if (comment.children && comment.children.length > 0) {
    const childList = document.createElement("ul");
    childList.className = "replies-list";
    let collapsed = depth >= 3;
    if (collapsed) {
      childList.style.display = "none";
    }
    comment.children.forEach((child) => {
      renderComment(child, childList, depth + 1);
    });
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

// ID normalization helper — good consistency with MongoDB ObjectIds.
function idToString(id) {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object" && "$oid" in id) return id.$oid;
  return id.toString();
}

// Handles new comment submission — clear logic and feedback.
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

// Toggle upvote on main post.
async function upvoteCurrentPost() {
  try {
    const response = await fetch(`/api/posts/${postId}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: currentUser.email }),
    });
    const data = await response.json();
    if (data.success) {
      await loadPost();
    } else {
      alert(data.message || "Failed to toggle post vote");
    }
  } catch (error) {
    console.error("Error toggling post vote:", error);
    alert("An error occurred while voting on the post. Please try again.");
  }
}

// Toggles upvote for comment — consistent design with post voting.
async function upvoteComment(commentId) {
  try {
    const response = await fetch(
      `/api/posts/${postId}/comments/${commentId}/upvote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: currentUser.email }),
      },
    );
    const data = await response.json();
    if (data.success) {
      await loadPost();
    } else {
      alert(data.message || "Failed to toggle comment vote");
    }
  } catch (error) {
    console.error("Error toggling comment vote:", error);
    alert("An error occurred while voting on the comment. Please try again.");
  }
}

// Centralized error display utility — good practice.
function showError(message) {
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("postContent").style.display = "none";
  document.getElementById("errorMessage").style.display = "block";
  document.getElementById("errorMessage").textContent = message;
}
