const mongoose = require("mongoose");

const millSchema = new mongoose.Schema(
  {
    millNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    contact: {
      phone: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        default: null,
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add a default empty contact object if it doesn't exist
millSchema.pre("save", function (next) {
  if (!this.contact) {
    this.contact = {};
  }
  next();
});

module.exports = mongoose.model("Mill", millSchema);