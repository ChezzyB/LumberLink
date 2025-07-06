const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Determine which Mongo URI to use
const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(`MongoDB connected (${process.env.NODE_ENV})`))
.catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/mills", require("./routes/millRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));