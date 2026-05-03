import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import path, { join, dirname } from "path";   // ✅ only this
import { fileURLToPath } from "url";    

import User from "./models/user.js";
import paymentRoutes from "./routes/payment.js"; // Cashfree routes

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

// -------- MIDDLEWARE --------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Webhook raw parser must come BEFORE express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// JSON body parser for all other routes
app.use(bodyParser.json());
app.use(express.json());

// -------- MONGODB CONNECTION --------
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI is missing in .env file!");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// -------- AUTH ROUTES --------
// 🟢 REGISTER (Sign Up)
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔵 LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------- PAYMENT ROUTES --------
app.use("/api/payments", paymentRoutes); // Cashfree integration

// -------- SERVE STATIC FILES --------
// Receipts folder (optional)
app.use("/receipts", express.static(path.join(process.cwd(), "receipts")));

// Donation folder (to serve success.html and other pages)
app.use("/donation", express.static(join(__dirname, "..", "donation")));
app.use("/home", express.static(join(__dirname, "..", "home")));
app.use("/about", express.static(join(__dirname, "..", "about")));
app.use("/map", express.static(join(__dirname, "..", "map")));
app.use("/dashboard", express.static(join(__dirname, "..", "dashboard")));

// -------- DEFAULT ROUTE --------
app.get("/", (req, res) => {
  res.send("✅ PawCare Auth + Payment Server is running...");
});

// -------- START SERVER --------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
