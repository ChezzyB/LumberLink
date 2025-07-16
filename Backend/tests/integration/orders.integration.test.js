const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import routes
const authRoutes = require('../../routes/authRoutes');
const orderRoutes = require('../../routes/orderRoutes');
const inventoryRoutes = require('../../routes/inventoryRoutes');
const millRoutes = require('../../routes/millRoutes');

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Create test app
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/mills', millRoutes);

describe('Order Integration Tests', () => {
  let authToken, userId, millId, inventoryId;

  beforeAll(async () => {
    // Register and login user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'integrationuser',
        email: 'integration@example.com',
        password: 'password123'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user._id;

    // Create mill
    const millResponse = await request(app)
      .post('/api/mills')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        millNumber: 'INT001',
        name: 'Integration Test Mill',
        location: {
          city: 'Vancouver',
          province: 'BC',
          latitude: 49.2827,
          longitude: -123.1207
        },
        owner: userId
      });

    millId = millResponse.body._id;

    // Create inventory
    const inventoryResponse = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        millId: millId,
        length: "8'",
        dimensions: "2x4",
        species: "SPF",
        grade: "#2 and better",
        dryingLevel: "KDHT",
        manufactureDate: new Date(),
        quantity: 50,
        price: {
          amount: 6.00,
          type: "per piece"
        }
      });

    inventoryId = inventoryResponse.body._id;
  });

  describe('Complete Order Flow', () => {
    it('should complete full order lifecycle', async () => {
      // Step 1: Place order
      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          items: [{
            inventoryId: inventoryId,
            quantity: 10
          }],
          totalAmount: 60.00
        })
        .expect(201);

      const orderId = orderResponse.body._id;
      expect(orderResponse.body.status).toBe('pending');

      // Step 2: Verify inventory decreased
      const inventoryResponse = await request(app)
        .get(`/api/inventory`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const inventory = inventoryResponse.body.find(item => item._id === inventoryId);
      expect(inventory.quantity).toBe(40);

      // Step 3: Get user orders
      const userOrdersResponse = await request(app)
        .get(`/api/orders/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(userOrdersResponse.body).toHaveLength(1);
      expect(userOrdersResponse.body[0]._id).toBe(orderId);

      // Step 4: Cancel order
      const cancelResponse = await request(app)
        .put(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(cancelResponse.body.order.status).toBe('cancelled');

      // Step 5: Verify inventory restored
      const restoredInventoryResponse = await request(app)
        .get(`/api/inventory`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const restoredInventory = restoredInventoryResponse.body.find(item => item._id === inventoryId);
      expect(restoredInventory.quantity).toBe(50);
    });
  });
});