const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/user/:userId", orderController.getOrdersByUser);
router.put("/:id/status", orderController.updateOrderStatus);
router.put("/:id/cancel", orderController.cancelOrder); // Add this new route
router.delete("/:id", orderController.deleteOrder);

module.exports = router;