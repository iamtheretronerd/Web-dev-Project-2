let currentUser = null;
let currentPost = null;
let postId = null;

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
  commentsList.innerHTML = "";
  const comments =
    currentPost && Array.isArray(currentPost.comments)
      ? currentPost.comments
      : [];
  if (comments.length === 0) {
    const li = document.createElement("li");
    li.className = "no-comments";
    li.textContent = "No comments yet.";
    commentsList.appendChild(li);
    return;
  }
  comments.forEach((comment) => {
    const li = document.createElement("li");
    li.className = "comment-item";

    // Upvote button for the comment
    const upvoteBtn = document.createElement("button");
    upvoteBtn.className = "comment-upvote-btn";
    upvoteBtn.innerHTML = `<span class="comment-vote-icon">▲</span> <span class="comment-vote-count">${comment.votes || 0}</span>`;
    // Apply upvoted class if current user already voted
    if (comment.voters && comment.voters.includes(currentUser.email)) {
      upvoteBtn.classList.add("upvoted");
    }
    upvoteBtn.addEventListener("click", () => {
      upvoteComment(comment.commentId);
    });

    // Comment text
    const textDiv = document.createElement("div");
    textDiv.className = "comment-text";
    textDiv.textContent = comment.text;

    // Comment meta (author and date)
    const metaDiv = document.createElement("div");
    metaDiv.className = "comment-meta";
    const author = comment.userEmail
      ? comment.userEmail.split("@")[0]
      : "Anonymous";
    const date = new Date(comment.date);
    metaDiv.textContent = `${author} • ${date.toLocaleDateString()}`;

    li.appendChild(upvoteBtn);
    li.appendChild(textDiv);
    li.appendChild(metaDiv);
    commentsList.appendChild(li);
  });
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
      // Refresh the post to update comment vote counts and button states
      await loadPost();
    } else {
      console.error(
        "Failed to toggle comment vote:",
        data.message || data.error,
      );
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
