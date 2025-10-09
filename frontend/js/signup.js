// Check if user is already logged in
window.addEventListener("DOMContentLoaded", () => {
  const user = sessionStorage.getItem("user");
  if (user) {
    window.location.href = "/dashboard.html";
  }

  // Set default avatar on page load
  const defaultAvatarUrl =
    "https://api.dicebear.com/9.x/thumbs/svg?seed=default";
  document.getElementById("avatarImg").src = defaultAvatarUrl;
});

// Generate avatar when name changes
document.getElementById("name").addEventListener("input", (e) => {
  const name = e.target.value.trim();
  if (name) {
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${encodeURIComponent(name)}`;
    document.getElementById("avatarImg").src = avatarUrl;
  } else {
    // Show default avatar when name is empty
    const defaultAvatarUrl =
      "https://api.dicebear.com/9.x/thumbs/svg?seed=default";
    document.getElementById("avatarImg").src = defaultAvatarUrl;
  }
});

// Handle signup form submission
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Check if passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Generate profile image URL
  const profileImage = `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${encodeURIComponent(name)}`;

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        profileImage,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("Signup successful! Please login.");
      window.location.href = "/login.html";
    } else {
      alert(data.message || "Signup failed. Please try again.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    alert("An error occurred. Please try again.");
  }
});
