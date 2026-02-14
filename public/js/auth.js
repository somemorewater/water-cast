

// Login Form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // Simulate login
    console.log("Login attempt:", { email, rememberMe });

    // Show success message
    alert("Login successful! Redirecting to home...");

    // Redirect to home page
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  });
}

// Signup Form
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;

    // Validation
    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    // Simulate signup
    console.log("Signup attempt:", { username, email });

    // Show success message
    alert("Account created successfully! Redirecting to login...");

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  });
}

// Password strength indicator (for signup)
const passwordInput = document.getElementById("password");
if (passwordInput && signupForm) {
  passwordInput.addEventListener("input", (e) => {
    const password = e.target.value;
    const strength = getPasswordStrength(password);

    // You can add visual feedback here
    console.log("Password strength:", strength);
  });
}

function getPasswordStrength(password) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  if (strength <= 2) return "weak";
  if (strength <= 3) return "medium";
  return "strong";
}
