// backend/controllers/adminController.js
import pool from '../database/db.js';

// Create a new event
export const addEvent = async (req, res) => {
  try {
    const { eventName, date, time, location, organizer, description, image, deadline, category } = req.body;
    
    // Validate required fields
    if (!eventName || !date || !time || !location || !organizer || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert event into database
    const result = await pool.query(
      `INSERT INTO events (event_name, category, date, time, location, organizer, description, image, deadline, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, event_name, category, date, time, location, organizer, description, image, deadline, created_at`,
      [eventName, category, date, time, location, organizer, description || null, image || null, deadline || null, req.user.userId]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};