document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  const user = sessionStorage.getItem("user");

  if (user) {
    // User is logged in, redirect to dashboard
    window.location.href = "/dashboard.html";
  }

  const getStartedBtn = document.getElementById("getStartedBtn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => {
      window.location.href = "/login.html";
    });
  }
});
