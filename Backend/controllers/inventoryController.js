const Mill = require("../models/Mill");
const Inventory = require("../models/Inventory");

exports.createInventory = async (req, res) => {
  try {
    let { millId, millNumber } = req.body;

    if (!millId && millNumber) {
      const mill = await Mill.findOne({ millNumber });
      if (!mill) {
        return res.status(400).json({ error: "Invalid millNumber" });
      }
      millId = mill._id;
    }

    if (!millId) {
      return res.status(400).json({ error: "millId or valid millNumber is required" });
    }

    const inventory = new Inventory({
      ...req.body,
      millId
    });

    await inventory.save();
    res.status(201).json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate("millId");
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inventory) return res.status(404).json({ error: "Inventory not found" });
    res.json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) return res.status(404).json({ error: "Inventory not found" });
    res.json({ message: "Inventory deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

