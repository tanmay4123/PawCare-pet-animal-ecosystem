// register.js

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const res = await fetch('http://localhost:8000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (data.success) {
            alert("Registration successful! Please login now.");
            window.location.href = '../index/index.html';
        } else {
            alert(data.message || "Registration failed. Try again.");
        }
    } catch (err) {
        console.error("Register error:", err);
        alert("Server not responding. Try again later.");
    }
    const d = document.getElementById('careDropdown');
    d.addEventListener('click', function(e){ e.stopPropagation(); this.classList.toggle('open'); });
    document.addEventListener('click', function(){ d.classList.remove('open'); });
});
