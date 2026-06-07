const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// POST /auth/register
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: "Password must be at least 4 characters" });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username: username.trim().toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: "Username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            username: username.trim().toLowerCase(),
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: savedUser._id, username: savedUser.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            token,
            username: savedUser.username
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /auth/login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Find user
        const user = await User.findOne({ username: username.trim().toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            username: user.username
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
