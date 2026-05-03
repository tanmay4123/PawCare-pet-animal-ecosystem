const express = require("express");
const router = express.Router();
const User = require("/models/user");
const bcrypt = require("bcryptjs");

// ----------------------- REGISTER -----------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { name, email }
    });
  } catch (err) {
    console.error("Register route error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------- LOGIN -----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Email not registered" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
