const mongoose = require("mongoose");

const millSchema = new mongoose.Schema({
  millNumber: {
    type: String,
    required: true,
    unique: true // Ensures no duplicate mill numbers
  },
  name: {
    type: String,
    required: true
  },
  location: {
    city: String,
    province: String,
    latitude: Number,
    longitude: Number
  },
  contact: {
    phone: String,
    email: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // reference to the User model
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Mill", millSchema, "mills");