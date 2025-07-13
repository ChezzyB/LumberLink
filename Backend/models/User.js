const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,  // Automatically convert to lowercase
    trim: true        // Remove whitespace
  },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save middleware to ensure email is lowercase
userSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

module.exports = mongoose.model("User", userSchema, "users");