const User = require('../../models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email.toLowerCase());
      expect(savedUser.createdAt).toBeDefined();
    });

    it('should convert email to lowercase', async () => {
      const userData = {
        username: 'testuser2',
        email: 'TEST@EXAMPLE.COM',
        passwordHash: 'hashedpassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe('test@example.com');
    });

    it('should fail without required fields', async () => {
      const user = new User({});

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.username).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.passwordHash).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        passwordHash: 'hashedpassword123'
      };

      await new User(userData).save();

      const duplicateUser = new User({
        username: 'user2',
        email: 'duplicate@example.com',
        passwordHash: 'hashedpassword456'
      });

      let error;
      try {
        await duplicateUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });
  });
});