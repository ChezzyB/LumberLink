const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User"); // Ensure the User model is imported
const bcrypt = require("bcryptjs"); // Ensure bcrypt is imported

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.get("/verify", authMiddleware, authController.verifyToken);
router.put("/change-password", authMiddleware, authController.changePassword);

// Add this temporary route for debugging
router.post("/debug-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ error: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    res.json({
      email: user.email,
      username: user.username,
      passwordProvided: password,
      passwordHash: user.passwordHash,
      isValid: isValid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;