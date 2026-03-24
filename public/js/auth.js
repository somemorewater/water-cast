const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const showError = (message) => {
  alert(message);
};

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const payload = await window.WatercastApi.fetchJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      window.WatercastApi.setToken(payload.token);
      alert("Login successful! Redirecting to home...");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 600);
    } catch (err) {
      showError(err.message || "Login failed");
    }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;

    if (password.length < 8) {
      showError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      showError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    try {
      const payload = await window.WatercastApi.fetchJson("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      window.WatercastApi.setToken(payload.token);
      alert("Account created! Redirecting to home...");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 600);
    } catch (err) {
      showError(err.message || "Signup failed");
    }
  });
}

const passwordInput = document.getElementById("password");
if (passwordInput && signupForm) {
  passwordInput.addEventListener("input", (e) => {
    const password = e.target.value;
    const strength = getPasswordStrength(password);
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
