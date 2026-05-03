document.addEventListener('DOMContentLoaded', () => {
  console.log("index.js loaded");

  // Tilt animation
  VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
    max: 15,
    speed: 400,
    glare: true,
    "max-glare": 0.3
  });

  const loginForm = document.getElementById('loginForm');
  const loginBtn = loginForm.querySelector('button[type="submit"]');
  const demoBtn = document.getElementById('demoBtn');
  const loginMessage = document.getElementById('loginMessage');

  function showMessage(msg, type = "error") {
    loginMessage.textContent = msg;
    loginMessage.style.color = type === "success" ? "green" : "red";
  }

  // Submit handler
  async function handleLogin(e) {
    e.preventDefault();
    loginMessage.textContent = "";

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!email || !password) {
      showMessage("⚠️ Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch('https://pawcare-pet-animal-ecosystem.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (data.success) {
        if (rememberMe) localStorage.setItem('user', JSON.stringify(data.user));
        else sessionStorage.setItem('user', JSON.stringify(data.user));

        showMessage(`🎉 Welcome back, ${data.user.name}!`, "success");
        setTimeout(() => window.location.href = '../home/home.html', 800);
      } else {
        showMessage(`❌ ${data.message || 'Login failed'}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      showMessage("🚨 Server not responding. Try again later.");
    }
  }

  // Attach to form submit (Enter key)
  loginForm.addEventListener('submit', handleLogin);
  // Attach to button click (ensure click works)
  loginBtn.addEventListener('click', handleLogin);

  // Demo login
  demoBtn.addEventListener('click', () => {
    const guestUser = { name: "Guest", email: "guest@pawcare.com" };
    localStorage.setItem('user', JSON.stringify(guestUser));
    window.location.href = '../about/about.html';
  });
});
