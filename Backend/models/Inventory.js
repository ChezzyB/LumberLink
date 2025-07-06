const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  millId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mill",
    required: true
  },
  length: {
    type: String,
    enum: ["8'", "10'", "12'", "14'", "16'", "18'", "20'", '92 5/8"', '104 5/8"'],
    required: true
  },
  dimensions: {
    type: String,
    enum: ["2x4", "2x6", "2x8", "2x10", "2x12"],
    required: true
  },
  species: {
    type: String,
    enum: ["SPF", "Douglas Fir", "Hemlock", "Western Red Cedar", "Yellow Cedar", "Larch"],
    required: true
  },
  grade: {
    type: String,
    enum: [
      "#2 and better",
      "#3",
      "Economy",
      "J-grade",
      "Select",
      "Square Edge",
      "Sawmill Rough Cut"
    ],
    required: true
  },
  dryingLevel: {
    type: String,
    enum: ["KDHT", "HT", "GR"], // Kiln Dried Heat Treated, Heat Treated, Green Lumber
    required: true
  },
  manufactureDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ["pieces", "bundles", "mbf"],
    default: "pieces"
  },
  price: {
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["per piece", "per board foot"],
      default: "per piece"
    }
  },
  notes: {
    type: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Inventory", inventorySchema, "inventories");