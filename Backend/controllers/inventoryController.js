const Inventory = require("../models/Inventory");

exports.createInventory = async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().populate("millId");
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};