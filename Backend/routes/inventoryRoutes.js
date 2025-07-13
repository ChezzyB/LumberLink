const express = require("express");
const router = express.Router();
const { createInventory, getInventory, updateInventory, deleteInventory } = require("../controllers/inventoryController");
const authMiddleware = require("../middleware/authMiddleware");

// Add auth middleware to all routes
router.use(authMiddleware);

router.get("/", getInventory);
router.get("/mill/:millId", async (req, res) => {
  try {
    const Inventory = require("../models/Inventory");
    const inventory = await Inventory.find({ millId: req.params.millId }).populate("millId");
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/", createInventory);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

module.exports = router;