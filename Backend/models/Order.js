const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  status: {
    type: String,
    enum: ["pending", "fulfilled", "cancelled"],
    default: "pending"
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema, "orders");