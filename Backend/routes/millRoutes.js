const express = require("express");
const router = express.Router();
const Mill = require("../models/Mill");
const millController = require("../controllers/millController");

// CREATE mill
router.post("/", millController.createMill);

// READ all mills with optional owner filter
router.get("/", async (req, res) => {
  try {
    const { owner } = req.query;
    const filter = owner ? { owner } : {};
    const mills = await Mill.find(filter);
    res.json(mills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ by MongoDB ObjectId
router.get("/id/:id", millController.getMillById);

// READ by millNumber
router.get("/:millNumber", async (req, res) => {
  try {
    const mill = await Mill.findOne({ millNumber: req.params.millNumber });
    if (!mill) {
      return res.status(404).json({ error: "Mill not found" });
    }
    res.json(mill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE mill
router.put("/:id", millController.updateMill);

// ASSIGN owner to mill
router.put("/:id/owner", millController.assignOwner);

// DELETE mill
router.delete("/:id", millController.deleteMill);

module.exports = router;