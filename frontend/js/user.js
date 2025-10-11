// Global variable for current user
let currentUser = null;

// Check if user is logged in
window.addEventListener("DOMContentLoaded", () => {
  const userStr = sessionStorage.getItem("user");

  if (!userStr) {
    window.location.href = "/login.html";
    return;
  }

  currentUser = JSON.parse(userStr);

  // Pre-fill form with current user data
  document.getElementById("name").value = currentUser.name;
  document.getElementById("email").value = currentUser.email;

  // Set initial avatar
  updateAvatar(currentUser.name);

  // Setup event listeners
  setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
  // Back button
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "/dashboard.html";
  });

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = "/dashboard.html";
  });

  // Name input change updates avatar
  document.getElementById("name").addEventListener("input", (e) => {
    const name = e.target.value.trim();
    updateAvatar(name || "default");
  });

  // Form submission
  document
    .getElementById("editProfileForm")
    .addEventListener("submit", handleFormSubmit);
}

// Update avatar based on name
function updateAvatar(name) {
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${encodeURIComponent(name)}`;
  document.getElementById("avatarImg").src = avatarUrl;
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validate password confirmation if password is provided
  if (password && password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Prepare update data
  const updateData = {
    name,
    email,
    currentEmail: currentUser.email,
  };

  // Only include password if user entered a new one
  if (password) {
    updateData.password = password;
  }

  // Update profile image URL based on new name
  updateData.profileImage = `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${encodeURIComponent(name)}`;

  try {
    const response = await fetch("/api/auth/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const updatedUser = {
        ...currentUser,
        name,
        email,
        profileImage: updateData.profileImage,
      };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated successfully!");
      window.location.href = "/dashboard.html";
    } else {
      alert(data.message || "Failed to update profile. Please try again.");
    }
  } catch (error) {
    console.error("Update profile error:", error);
    alert("An error occurred. Please try again.");
  }
}
