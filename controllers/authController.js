// controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './../database/db.js';

export const register = async (req, res) => {
  try {
    // 1. Get username from the request body
    const {username, email, password} = req.body;

    // 2. Check if email OR username already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({error: 'Email or Username already exists'});
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert the new user with the username
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    res.status(201).json({
        message: 'User registered successfully',
        user: newUser.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const login = async (req, res) => {
  try {
    const {email, password} = req.body;
    const userResult = await pool.query (
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status (401).json ({error: 'Invalid credentials'});
    }

    const user = userResult.rows[0];
    const isValidPassword = await bcrypt.compare (password, user.password_hash);
    if (!isValidPassword) {
      return res.status (401).json ({error: 'Invalid credentials'});
    }

    // Create Access & Refresh Tokens
    const accessToken = jwt.sign (
      {userId: user.id},
      process.env.JWT_ACCESS_SECRET,
      {expiresIn: '15m'}
    );
    const refreshToken = jwt.sign (
      {userId: user.id},
      process.env.JWT_REFRESH_SECRET,
      {expiresIn: '7d'}
    );

    // Store refresh token in the database
    await pool.query ('UPDATE users SET refresh_token = $1 WHERE id = $2', [
      refreshToken,
      user.id,
    ]);

    res.json ({accessToken, refreshToken});
  } catch (err) {
    console.error (err.message);
    res.status (500).send ('Server error');
  }
};

export const refresh = async (req, res) => {
  const {token} = req.body;
  if (!token) return res.sendStatus (401);

  // Find user by their refresh token
  const userResult = await pool.query (
    'SELECT * FROM users WHERE refresh_token = $1',
    [token]
  );
  if (userResult.rows.length === 0) return res.sendStatus (403);

  jwt.verify (token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus (403);

    const accessToken = jwt.sign (
      {userId: user.userId},
      process.env.JWT_ACCESS_SECRET,
      {expiresIn: '15m'}
    );
    res.json ({accessToken});
  });
};

export const logout = async (req, res) => {
  const {token} = req.body;
  // Simply clear the refresh token from the database
  await pool.query (
    'UPDATE users SET refresh_token = NULL WHERE refresh_token = $1',
    [token]
  );
  res.sendStatus (204); // No Content
};
