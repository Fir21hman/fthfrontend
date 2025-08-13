document.addEventListener("DOMContentLoaded", () => {
  const { createClient } = supabase;
  const supabaseClient = createClient(
    "https://potvmgchhffpgkiczsco.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdHZtZ2NoaGZmcGdraWN6c2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mzc0NDYsImV4cCI6MjA3MDUxMzQ0Nn0.Rw-ypl0Z3ccguWSS6OCmFOBDagLQM01zmoR9t4POThg"
  );

// --- Handle email verification redirect ---
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get("access_token");
const type = urlParams.get("type");

if (type === "signup" && accessToken) {
  supabaseClient.auth.setSession({
    access_token: accessToken,
    refresh_token: urlParams.get("refresh_token"),
  }).then(({ data, error }) => {
    if (error) {
      alert("Verification failed: " + error.message);
    } else {
      alert("✅ Email verified! You can now log in.");
    }
  });

}

  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const authForm = document.getElementById("authForm");

  function renderLoginForm() {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    authForm.innerHTML = `
      <form id="loginForm">
        <input type="email" id="loginEmail" placeholder="Email" required>
        <input type="password" id="loginPassword" placeholder="Password" required>
        <a href="forgot-password.html" class="forgot-link">Forgot Password?</a>
        <button type="submit">Login</button>
      </form>
    `;
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
  }

  function renderSignupForm() {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    authForm.innerHTML = `
      <form id="signupForm">
        <input type="text" id="firstName" placeholder="First Name" required>
        <input type="text" id="lastName" placeholder="Last Name" required>
        <input type="text" id="username" placeholder="Username/Nickname" required>
        <input type="email" id="signupEmail" placeholder="Email" required>
        <input type="password" id="signupPassword" placeholder="Password" required>
        <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
        <button type="submit">Sign Up</button>
      </form>
    `;
    document.getElementById("signupForm").addEventListener("submit", handleSignup);
  }

  async function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirm = document.getElementById("confirmPassword").value.trim();

    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert("✅ Account created! Please check your email to verify before logging in.");
      renderLoginForm();
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      localStorage.setItem("supabaseSession", JSON.stringify(data.session));
      window.location.href = "form.html";
    }
  }

  loginTab.addEventListener("click", renderLoginForm);
  signupTab.addEventListener("click", renderSignupForm);

  renderLoginForm();
});




