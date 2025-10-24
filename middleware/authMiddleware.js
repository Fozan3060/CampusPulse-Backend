// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';

// Middleware to check if user is authenticated
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user; // The payload { userId, role } is now on req.user
    next();
  });
};

// Middleware to check if user is an Admin
export const authorizeAdmin = (req, res, next) => {
  // This middleware MUST run *after* authenticateToken
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
};