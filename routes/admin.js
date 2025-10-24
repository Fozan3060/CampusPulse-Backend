// backend/routes/admin.js
import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';
// We'll create the addEvent function in the next step
import { addEvent } from '../controllers/adminController.js';

const router = express.Router();

// Changed to POST and a more descriptive path
router.post('/add-event', authenticateToken, authorizeAdmin, addEvent);

export default router;