const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: normalizedEmail }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: "User with this email or username already exists" 
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email: normalizedEmail,
      passwordHash
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    console.log("Login attempt for email:", normalizedEmail); // Debug log

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log("User not found for email:", normalizedEmail); // Debug log
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("User found:", user.username); // Debug log

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log("Password valid:", isPasswordValid); // Debug log
    
    if (!isPasswordValid) {
      console.log("Invalid password for user:", normalizedEmail); // Debug log
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log("Login successful for user:", normalizedEmail); // Debug log

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  res.json({ message: "Logged out successfully" });
};

exports.verifyToken = async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};