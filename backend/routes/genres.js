const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM genres ORDER BY name');
  res.json(rows);
});

router.post('/', verifyToken, async (req, res) => {
  const { name } = req.body;
  await pool.query('INSERT INTO genres (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
  res.status(201).json({ message: 'Genre added' });
});

module.exports = router;