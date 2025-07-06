const express = require("express");
const router = express.Router();
const { createInventory, getInventory } = require("../controllers/inventoryController");

router.get("/", getInventory);
router.post("/", createInventory);

module.exports = router;