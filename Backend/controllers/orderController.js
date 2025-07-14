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

// Alternative: Add a separate cancel order function (recommended)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }

    console.log('Cancelling order:', req.params.id);
    console.log('Order items to restore:', order.items);

    // Restore inventory quantities
    for (const item of order.items) {
      console.log(`Restoring ${item.quantity} units to inventory ${item.inventoryId}`);
      
      const inventory = await Inventory.findById(item.inventoryId);
      if (inventory) {
        const oldQuantity = inventory.quantity;
        inventory.quantity += item.quantity;
        await inventory.save();
        console.log(`Inventory ${inventory._id}: ${oldQuantity} -> ${inventory.quantity} (restored ${item.quantity})`);
      } else {
        console.warn(`Inventory item not found: ${item.inventoryId}`);
      }
    }

    // Update order status to cancelled instead of deleting
    order.status = 'cancelled';
    await order.save();

    console.log('Order cancelled successfully');

    res.json({ 
      message: "Order cancelled successfully. Items have been returned to inventory.",
      order: order,
      restoredItems: order.items.length
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: err.message });
  }
};

// Optional: Update your existing deleteOrder function to also restore inventory
exports.deleteOrder = async (req, res) => {
  try {
    // First, find the order to get the items before deleting
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Only restore inventory if order is pending (not if already fulfilled or cancelled)
    if (order.status === 'pending') {
      console.log('Deleting pending order, restoring inventory...');
      
      // Restore inventory quantities for each item
      for (const item of order.items) {
        const inventory = await Inventory.findById(item.inventoryId);
        if (inventory) {
          inventory.quantity += item.quantity;
          await inventory.save();
          console.log(`Restored ${item.quantity} units to inventory ${inventory._id}`);
        } else {
          console.warn(`Inventory item not found: ${item.inventoryId}`);
        }
      }
    }

    // Now delete the order
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: "Order deleted and inventory restored",
      restoredItems: order.items.length
    });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: err.message });
  }
};