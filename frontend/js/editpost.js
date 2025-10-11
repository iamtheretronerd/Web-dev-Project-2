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

  // Get post ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  postId = urlParams.get("id");

  if (!postId) {
    showError("No post ID provided");
    return;
  }

  setupEventListeners();

  await loadPost();
});

function setupEventListeners() {
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "/dashboard.html";
  });

  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = "/dashboard.html";
  });

  document
    .getElementById("editPostForm")
    .addEventListener("submit", handleFormSubmit);
}

// Load post data
async function loadPost() {
  try {
    const response = await fetch(`/api/posts/single?id=${postId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch post");
    }

    const data = await response.json();

    if (data.success && data.post) {
      currentPost = data.post;

      // Verify that the current user owns this post
      if (currentPost.userEmail !== currentUser.email) {
        showError("You don't have permission to edit this post");
        return;
      }

      displayPost();
    } else {
      showError("Post not found");
    }
  } catch (error) {
    console.error("Error loading post:", error);
    showError("Failed to load post. Please try again.");
  }
}

// Display post in form
function displayPost() {
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("editPostForm").style.display = "block";

  document.getElementById("postTitle").value = currentPost.title;
  document.getElementById("postDescription").value = currentPost.description;
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("postTitle").value.trim();
  const description = document.getElementById("postDescription").value.trim();

  if (!title || !description) {
    alert("Please fill in both title and description");
    return;
  }

  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        userEmail: currentUser.email,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("Post updated successfully!");
      window.location.href = "/dashboard.html";
    } else {
      alert(data.message || "Failed to update post. Please try again.");
    }
  } catch (error) {
    console.error("Update post error:", error);
    alert("An error occurred while updating the post. Please try again.");
  }
}

// Show error message
function showError(message) {
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("editPostForm").style.display = "none";
  document.getElementById("errorMessage").style.display = "block";
  document.getElementById("errorMessage").textContent = message;
}
