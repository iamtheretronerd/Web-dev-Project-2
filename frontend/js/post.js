let currentUser = null;
let currentPost = null;
let postId = null;

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
    // TODO: Implement upvote functionality
    console.log("Upvote clicked for post:", postId);
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
}

// Show error message
function showError(message) {
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("postContent").style.display = "none";
  document.getElementById("errorMessage").style.display = "block";
  document.getElementById("errorMessage").textContent = message;
}
