const authMiddleware = require('../../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should pass with valid token', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ userId }, JWT_SECRET);
    
    req.header.mockReturnValue(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(req.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should fail without authorization header', () => {
    req.header.mockReturnValue(null);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Access denied. No valid token provided.' 
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should fail with malformed token', () => {
    req.header.mockReturnValue('Bearer invalidtoken');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should fail with expired token', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '-1s' });
    
    req.header.mockReturnValue(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
    expect(next).not.toHaveBeenCalled();
  });
});