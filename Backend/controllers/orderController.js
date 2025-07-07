const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

exports.createOrder = async (req, res) => {
  const { userId, items, totalAmount } = req.body;

  try {
    // Check and update inventory for each item
    for (const item of items) {
      const inventory = await Inventory.findById(item.inventoryId);
      if (!inventory) {
        return res.status(400).json({ error: `Inventory item not found: ${item.inventoryId}` });
      }

      if (inventory.quantity < item.quantity) {
        return res.status(400).json({
          error: `Not enough quantity in inventory for item ${item.inventoryId}. Available: ${inventory.quantity}, Requested: ${item.quantity}`
        });
      }

      // Decrease inventory
      inventory.quantity -= item.quantity;
      await inventory.save();
    }

    // Create order
    const order = new Order({ userId, items, totalAmount });
    await order.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
                              .populate("items.inventoryId")
                              .populate("userId", "username email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
                              .populate("items.inventoryId")
                              .populate("userId", "username email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};