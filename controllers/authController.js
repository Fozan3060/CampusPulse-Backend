
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './../database/db.js';

export const register = async (req, res) => {
  try {
    const {username, email, password} = req.body;
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({error: 'Email or Username already exists'});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // The 'role' column will automatically get 'user' as its default value
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role',
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


// 1. LOGIN (MODIFIED)
export const login = async (req, res) => {
  try {
    const {email, password} = req.body;
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({error: 'Invalid credentials'});
    }

    const user = userResult.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({error: 'Invalid credentials'});
    }

    // === START MODIFICATION ===
    // Create Access Token with role
    const accessToken = jwt.sign(
      {userId: user.id, role: user.role}, // ADDED 'role' TO PAYLOAD
      process.env.JWT_ACCESS_SECRET,
      {expiresIn: '15m'}
    );
    
    // Create Refresh Token (payload is just userId)
    const refreshToken = jwt.sign(
      {userId: user.id},
      process.env.JWT_REFRESH_SECRET,
      {expiresIn: '7d'}
    );
    // === END MODIFICATION ===

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [
      refreshToken,
      user.id,
    ]);

    res.json({accessToken, refreshToken});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 2. REFRESH (MODIFIED)
export const refresh = async (req, res) => {
  const {token} = req.body;
  if (!token) return res.sendStatus(401);

  const userResult = await pool.query(
    'SELECT * FROM users WHERE refresh_token = $1',
    [token]
  );
  if (userResult.rows.length === 0) return res.sendStatus(403);
  
  const userInDb = userResult.rows[0]; // The user from our database

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err || user.userId !== userInDb.id) return res.sendStatus(403);

    // === START MODIFICATION ===
    // User is verified, create a new access token
    // We use the 'role' from the database (userInDb.role)
    // This ensures that if a user's role was changed,
    // they get the updated role on their next refresh.
    const accessToken = jwt.sign(
      {userId: user.userId, role: userInDb.role}, // Use fresh role from DB
      process.env.JWT_ACCESS_SECRET,
      {expiresIn: '15m'}
    );
    
    res.json({accessToken});
  });
};

export const logout = async (req, res) => {
  const {token} = req.body;
  await pool.query(
    'UPDATE users SET refresh_token = NULL WHERE refresh_token = $1',
    [token]
  );
  res.sendStatus(204); // No Content
};