// backend/controllers/userController.js
import pool from '../database/db.js';

export const getUserProfile = async (req, res) => {
  try {
    // The user's ID is available from the authenticateToken middleware
    const userId = req.user.userId;

    // Query the database for the user's details, making sure NOT to select sensitive data
    const user = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send the user profile data back
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};