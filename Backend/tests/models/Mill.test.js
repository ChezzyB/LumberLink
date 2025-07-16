const Mill = require('../../models/Mill');
const User = require('../../models/User');

describe('Mill Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await new User({
      username: 'millowner',
      email: 'owner@example.com',
      passwordHash: 'hashedpassword123'
    }).save();
  });

  describe('Mill Creation', () => {
    it('should create a mill with valid data', async () => {
      const millData = {
        millNumber: 'M001',
        name: 'Test Mill',
        location: {
          city: 'Vancouver',
          province: 'BC',
          latitude: 49.2827,
          longitude: -123.1207
        },
        contact: {
          phone: '555-0123',
          email: 'mill@example.com'
        },
        owner: testUser._id
      };

      const mill = new Mill(millData);
      const savedMill = await mill.save();

      expect(savedMill._id).toBeDefined();
      expect(savedMill.millNumber).toBe(millData.millNumber);
      expect(savedMill.name).toBe(millData.name);
      expect(savedMill.location.city).toBe(millData.location.city);
      expect(savedMill.owner).toEqual(testUser._id);
    });

    it('should fail without required fields', async () => {
      const mill = new Mill({});

      let error;
      try {
        await mill.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.millNumber).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    it('should have default empty contact object', async () => {
      const millData = {
        millNumber: 'M002',
        name: 'Test Mill 2',
        location: {
          city: 'Vancouver',
          province: 'BC',
          latitude: 49.2827,
          longitude: -123.1207
        }
      };

      const mill = new Mill(millData);
      const savedMill = await mill.save();

      expect(savedMill.contact).toBeDefined();
      expect(typeof savedMill.contact).toBe('object');
    });
  });
});