/* ===== Elements + state ===== */
let currentRole = "student";
const roleTabs = document.querySelectorAll(".role-tab");
const emailLabel = document.getElementById("email-label");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error");
const loginBox = document.getElementById("login-box");
const successBox = document.getElementById("success");
const themeToggle = document.getElementById("theme-toggle");

/* ===== Dark / light theme ===== */
function updateThemeText() {
  const isDark = document.body.classList.contains("dark");
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  themeToggle.setAttribute("aria-label", label);
  themeToggle.setAttribute("title", label);
  themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
  document.getElementById("theme-icon").innerHTML = isDark
    ? '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2.2"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
    : '<path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>';
}

try {
  if (localStorage.getItem("ll-theme") === "dark") document.body.classList.add("dark");
} catch (e) {}
updateThemeText();

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  try {
    localStorage.setItem("ll-theme", document.body.classList.contains("dark") ? "dark" : "light");
  } catch (e) {}
  updateThemeText();
});

/* ===== Student / Admin tabs ===== */
roleTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    currentRole = tab.dataset.role;
    roleTabs.forEach(function (item) {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-pressed", "true");
    emailLabel.textContent = currentRole === "student" ? "Student email" : "Admin email";
    emailInput.placeholder = currentRole === "student" ? "you@school.edu" : "admin@school.edu";
    document.getElementById("submit-text").textContent = "Enter as " + currentRole;
    errorMessage.classList.remove("visible");
  });
});

/* ===== Show / hide password ===== */
document.getElementById("show-password").addEventListener("click", function () {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  this.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});

/* ===== Sign in (saves user, opens dashboard) ===== */
document.getElementById("login-form").addEventListener("submit", function (event) {
  event.preventDefault();
  if (!emailInput.value.trim() || !passwordInput.value.trim()) {
    errorMessage.classList.add("visible");
    return;
  }
  errorMessage.classList.remove("visible");
  try {
    sessionStorage.setItem("ll-user", JSON.stringify({ role: currentRole, email: emailInput.value.trim() }));
  } catch (e) {}
  window.location.href = currentRole === "admin" ? "admin.html" : "student.html";
});

/* ===== Back to sign in ===== */
document.getElementById("back-button").addEventListener("click", function () {
  successBox.classList.remove("visible");
  loginBox.style.display = "block";
});

/* ===== Demo account button ===== */
document.getElementById("demo-button").addEventListener("click", function () {
  emailInput.value = currentRole === "student" ? "student@demo.edu" : "admin@demo.edu";
  passwordInput.value = "demo1234";
  errorMessage.classList.remove("visible");
});