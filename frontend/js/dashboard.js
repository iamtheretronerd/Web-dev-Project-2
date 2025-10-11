let currentUser = null;
let currentPage = 1;
let currentView = "all"; // 'all' or 'my'
let isSearching = false;
let hasMorePosts = true;

// Check if user is logged in
window.addEventListener("DOMContentLoaded", () => {
  const userStr = sessionStorage.getItem("user");

  if (!userStr) {
    window.location.href = "/login.html";
    return;
  }

  currentUser = JSON.parse(userStr);
  document.getElementById("userNameDisplay").textContent = currentUser.name;

  currentUser = JSON.parse(userStr);
  document.getElementById("userNameDisplay").textContent = currentUser.name;

  document.getElementById("userAvatar").src =
    currentUser.profileImage ||
    `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${encodeURIComponent(currentUser.name)}`;

  // Initialize event listeners
  setupEventListeners();

  // Load initial posts
  loadPosts();
});

// Set up all event listeners
function setupEventListeners() {
  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("user");
    window.location.href = "/";
  });

  document.getElementById("userAvatar").addEventListener("click", () => {
    window.location.href = "/user.html";
  });

  document.getElementById("userAvatar").style.cursor = "pointer";

  // Create post
  document
    .getElementById("createPostBtn")
    .addEventListener("click", createPost);

  // Toggle between all posts and my posts
  document.getElementById("allPostsBtn").addEventListener("click", () => {
    if (currentView !== "all") {
      currentView = "all";
      currentPage = 1;
      document.getElementById("allPostsBtn").classList.add("active");
      document.getElementById("myPostsBtn").classList.remove("active");
      loadPosts();
    }
  });

  document.getElementById("myPostsBtn").addEventListener("click", () => {
    if (currentView !== "my") {
      currentView = "my";
      currentPage = 1;
      document.getElementById("myPostsBtn").classList.add("active");
      document.getElementById("allPostsBtn").classList.remove("active");
      loadPosts();
    }
  });

  document.getElementById("searchBtn").addEventListener("click", searchPosts);
  document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchPosts();
  });

  document
    .getElementById("clearSearchBtn")
    .addEventListener("click", clearSearch);

  document.getElementById("loadMoreBtn").addEventListener("click", () => {
    currentPage++;
    loadPosts(true);
  });
}

// Create a new post
async function createPost() {
  const title = document.getElementById("postTitle").value.trim();
  const description = document.getElementById("postDescription").value.trim();

  if (!title || !description) {
    alert("Please enter both title and description");
    return;
  }

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
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

    if (data.success) {
      // Clear form
      document.getElementById("postTitle").value = "";
      document.getElementById("postDescription").value = "";

      // Reload posts
      currentPage = 1;
      loadPosts();
    } else {
      alert(data.message || "Failed to create post");
    }
  } catch (error) {
    console.error("Error creating post:", error);
    alert("An error occurred while creating the post");
  }
}

// Load posts
async function loadPosts(append = false) {
  try {
    let url;
    if (isSearching) {
      return;
    }

    if (currentView === "my") {
      url = `/api/posts/my-posts?page=${currentPage}&userEmail=${currentUser.email}`;
    } else {
      url = `/api/posts?page=${currentPage}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      displayPosts(data.posts, append);
      hasMorePosts = data.hasMore;

      document.getElementById("loadMoreBtn").style.display = hasMorePosts
        ? "block"
        : "none";

      document.getElementById("noPostsMessage").style.display =
        data.posts.length === 0 && currentPage === 1 ? "block" : "none";
    }
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}

// Display posts in the grid
function displayPosts(posts, append = false) {
  const grid = document.getElementById("postsGrid");

  if (!append) {
    grid.innerHTML = "";
  }

  posts.forEach((post) => {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.dataset.postId = post._id;

    const postDate = new Date(post.date).toLocaleDateString();

    postCard.innerHTML = `
            <div class="post-title">${post.title}</div>
            <div class="post-meta">
                <span class="post-author">by ${post.userEmail.split("@")[0]}</span>
                <span class="post-date">${postDate}</span>
            </div>
        `;

    postCard.addEventListener("click", () => {
      window.location.href = `/post.html?id=${post._id}`;
    });

    grid.appendChild(postCard);
  });
}

// Search posts
async function searchPosts() {
  const searchTerm = document.getElementById("searchInput").value.trim();

  if (!searchTerm) {
    alert("Please enter a search term");
    return;
  }

  try {
    isSearching = true;
    const response = await fetch(
      `/api/posts/search?q=${encodeURIComponent(searchTerm)}`,
    );
    const data = await response.json();

    if (data.success) {
      displayPosts(data.posts);
      document.getElementById("clearSearchBtn").style.display = "block";
      document.getElementById("loadMoreBtn").style.display = "none";

      // Show no posts message if no results
      document.getElementById("noPostsMessage").style.display =
        data.posts.length === 0 ? "block" : "none";
    }
  } catch (error) {
    console.error("Error searching posts:", error);
    alert("An error occurred while searching");
  }
}

// Clear search and reload posts
function clearSearch() {
  document.getElementById("searchInput").value = "";
  document.getElementById("clearSearchBtn").style.display = "none";
  isSearching = false;
  currentPage = 1;
  loadPosts();
}
