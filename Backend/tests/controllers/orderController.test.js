const request = require('supertest');
const express = require('express');
const orderController = require('../../controllers/orderController');
const User = require('../../models/User');
const Mill = require('../../models/Mill');
const Inventory = require('../../models/Inventory');
const Order = require('../../models/Order');

const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req, res, next) => {
  req.userId = 'mockUserId';
  next();
});

app.post('/orders', orderController.createOrder);
app.get('/orders/user/:userId', orderController.getOrdersByUser);
app.put('/orders/:id/cancel', orderController.cancelOrder);

describe('Order Controller', () => {
  let testUser, testMill, testInventory;

  beforeEach(async () => {
    testUser = await new User({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpassword'
    }).save();

    testMill = await new Mill({
      millNumber: 'M001',
      name: 'Test Mill',
      location: {
        city: 'Vancouver',
        province: 'BC',
        latitude: 49.2827,
        longitude: -123.1207
      }
    }).save();

    testInventory = await new Inventory({
      millId: testMill._id,
      length: "8'",
      dimensions: "2x4",
      species: "SPF",
      grade: "#2 and better",
      dryingLevel: "KDHT",
      manufactureDate: new Date(),
      quantity: 100,
      price: {
        amount: 5.50,
        type: "per piece"
      }
    }).save();
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        userId: testUser._id,
        items: [{
          inventoryId: testInventory._id,
          quantity: 10
        }],
        totalAmount: 55.00
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.userId).toBe(testUser._id.toString());
      expect(response.body.items).toHaveLength(1);
      expect(response.body.totalAmount).toBe(55.00);
      expect(response.body.status).toBe('pending');

      // Verify inventory was decremented
      const updatedInventory = await Inventory.findById(testInventory._id);
      expect(updatedInventory.quantity).toBe(90);
    });

    it('should fail if inventory quantity is insufficient', async () => {
      const orderData = {
        userId: testUser._id,
        items: [{
          inventoryId: testInventory._id,
          quantity: 150 // More than available
        }],
        totalAmount: 825.00
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('Not enough quantity');

      // Verify inventory was not changed
      const unchangedInventory = await Inventory.findById(testInventory._id);
      expect(unchangedInventory.quantity).toBe(100);
    });

    it('should fail if inventory item does not exist', async () => {
      const orderData = {
        userId: testUser._id,
        items: [{
          inventoryId: '507f1f77bcf86cd799439011', // Non-existent ID
          quantity: 10
        }],
        totalAmount: 55.00
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('Inventory item not found');
    });
  });

  describe('GET /orders/user/:userId', () => {
    it('should get orders for a specific user', async () => {
      // Create test order
      const order = await new Order({
        userId: testUser._id,
        items: [{
          inventoryId: testInventory._id,
          quantity: 5
        }],
        totalAmount: 27.50,
        status: 'pending'
      }).save();

      const response = await request(app)
        .get(`/orders/user/${testUser._id}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]._id).toBe(order._id.toString());
      expect(response.body[0].totalAmount).toBe(27.50);
    });

    it('should return empty array for user with no orders', async () => {
      const response = await request(app)
        .get(`/orders/user/${testUser._id}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('PUT /orders/:id/cancel', () => {
    let testOrder;

    beforeEach(async () => {
      // Reduce inventory for the test
      testInventory.quantity = 90;
      await testInventory.save();

      testOrder = await new Order({
        userId: testUser._id,
        items: [{
          inventoryId: testInventory._id,
          quantity: 10
        }],
        totalAmount: 55.00,
        status: 'pending'
      }).save();
    });

    it('should cancel pending order and restore inventory', async () => {
      const response = await request(app)
        .put(`/orders/${testOrder._id}/cancel`)
        .expect(200);

      expect(response.body.message).toContain('cancelled successfully');
      expect(response.body.order.status).toBe('cancelled');

      // Verify inventory was restored
      const restoredInventory = await Inventory.findById(testInventory._id);
      expect(restoredInventory.quantity).toBe(100);

      // Verify order status was updated
      const cancelledOrder = await Order.findById(testOrder._id);
      expect(cancelledOrder.status).toBe('cancelled');
    });

    it('should not cancel non-pending order', async () => {
      // Update order to fulfilled
      testOrder.status = 'fulfilled';
      await testOrder.save();

      const response = await request(app)
        .put(`/orders/${testOrder._id}/cancel`)
        .expect(400);

      expect(response.body.error).toBe('Only pending orders can be cancelled');

      // Verify inventory was not changed
      const unchangedInventory = await Inventory.findById(testInventory._id);
      expect(unchangedInventory.quantity).toBe(90);
    });

    it('should fail for non-existent order', async () => {
      const response = await request(app)
        .put('/orders/507f1f77bcf86cd799439011/cancel')
        .expect(404);

      expect(response.body.error).toBe('Order not found');
    });
  });
});