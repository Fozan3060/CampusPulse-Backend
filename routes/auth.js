// routes/auth.js
import express from 'express';
import { register, login, refresh, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh); // For getting a new access token
router.post('/logout', logout);   // To invalidate a refresh token

export default router;