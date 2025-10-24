// backend/routes/user.js
import express from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users/me
// This route is protected. It will first run authenticateToken.
// If the token is valid, it will then run getUserProfile.
router.get('/me', authenticateToken, getUserProfile);

export default router;