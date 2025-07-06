const Mill = require("../models/Mill");

// CREATE a new mill
exports.createMill = async (req, res) => {
  try {
    const mill = new Mill(req.body);
    await mill.save();
    res.status(201).json(mill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ all mills
exports.getAllMills = async (req, res) => {
  try {
    const mills = await Mill.find();
    res.json(mills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ single mill by ID
exports.getMillById = async (req, res) => {
  try {
    const mill = await Mill.findById(req.params.id);
    if (!mill) return res.status(404).json({ error: "Mill not found" });
    res.json(mill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE existing mill
exports.updateMill = async (req, res) => {
  try {
    const mill = await Mill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mill) return res.status(404).json({ error: "Mill not found" });
    res.json(mill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE a mill
exports.deleteMill = async (req, res) => {
  try {
    const mill = await Mill.findByIdAndDelete(req.params.id);
    if (!mill) return res.status(404).json({ error: "Mill not found" });
    res.json({ message: "Mill deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ASSIGN an owner
exports.assignOwner = async (req, res) => {
  const sawmillId = req.params.id;
  const { ownerId } = req.body;

  if (!ownerId) {
    return res.status(400).json({ error: "ownerId is required" });
  }

  try {
    const updatedMill = await Mill.findByIdAndUpdate(
      sawmillId,
      { owner: ownerId },
      { new: true }
    );

    if (!updatedMill) {
      return res.status(404).json({ error: "Sawmill not found" });
    }

    res.json({ message: "Owner assigned", mill: updatedMill });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};