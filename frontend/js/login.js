// Check if user is already logged in
window.addEventListener("DOMContentLoaded", () => {
  const user = sessionStorage.getItem("user");
  if (user) {
    window.location.href = "/dashboard.html";
  }
});

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store user data in sessionStorage
      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      window.location.href = "/dashboard.html";
    } else {
      alert(data.message || "Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred. Please try again.");
  }
});
