const request = require('supertest');
const express = require('express');
const authController = require('../../controllers/authController');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.post('/register', authController.register);
app.post('/login', authController.login);

describe('Auth Controller', () => {
  describe('POST /register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email.toLowerCase());
      expect(response.body.user.passwordHash).toBeUndefined();

      // Verify user was saved to database
      const savedUser = await User.findOne({ email: userData.email.toLowerCase() });
      expect(savedUser).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
    });

    it('should not register user with existing email', async () => {
      const userData = {
        username: 'user1',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Create existing user
      await new User({
        username: 'existinguser',
        email: 'existing@example.com',
        passwordHash: await bcrypt.hash('somepassword', 12)
      }).save();

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/register')
        .send({})
        .expect(500); // Your controller returns 500 for validation errors

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /login', () => {
    let testUser;
    const password = 'testpassword123';

    beforeEach(async () => {
      const passwordHash = await bcrypt.hash(password, 12);
      testUser = await new User({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash
      }).save();
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: password
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: password
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should handle case insensitive email', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: password
        })
        .expect(200);

      expect(response.body.user.email).toBe('test@example.com');
    });
  });
});