const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
    [name, email, hashed]
  );
  res.status(201).json({ message: 'User registered' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password, remember } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  let refreshToken;
  if (remember) {
    refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    await pool.query('INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)', [user.id, refreshToken]);
  }

  res.json({ accessToken, refreshToken });
});

// Refresh
router.post('/refresh', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'Refresh token required' });

  const { rows } = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
  if (rows.length === 0) return res.status(403).json({ error: 'Invalid refresh token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid refresh token' });
    const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ accessToken });
  });
});

// Logout (single device)
router.post('/logout', async (req, res) => {
  const { token } = req.body;
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  res.json({ message: 'Logged out' });
});

// Logout all devices
router.post('/logout-all', async (req, res) => {
  const { user_id } = req.body;
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user_id]);
  res.json({ message: 'Logged out everywhere' });
});

// Change password
router.post('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(403).json({ error: 'Wrong password' });

  const newHashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHashed, user.id]);
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user.id]);
  res.json({ message: 'Password updated and sessions cleared' });
});

module.exports = router;