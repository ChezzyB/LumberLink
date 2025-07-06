const mongoose = require("mongoose");

const millSchema = new mongoose.Schema({
  name: String,
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
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Mill", millSchema);