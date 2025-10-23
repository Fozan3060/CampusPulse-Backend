// backend/index.js

import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3001;

const JWT_SECRET = 'your-super-secret-key-that-should-be-long-and-random';

// ==> Middleware
app.use(cors()); // Allows cross-origin requests (from our React app)
app.use(express.json()); // Allows us to parse JSON in the request body

// ==> PostgreSQL Connection Setup
const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',       // Your PostgreSQL username
  host: 'localhost',
  database: 'CampusPulse',   // The database we created
  password: '123', // Your PostgreSQL password
  port: 5432,
});

// ==> AUTHENTICATION ROUTES
// ===================================

// 1. Register a new user
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save the new user
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// 2. Login a user
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user.rows[0].id }, // Payload
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});