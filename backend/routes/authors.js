const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM authors ORDER BY name');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM authors WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.post('/', verifyToken, async (req, res) => {
  const { name, bio } = req.body;
  await pool.query('INSERT INTO authors (name, bio) VALUES ($1, $2)', [name, bio]);
  res.status(201).json({ message: 'Author added' });
});

module.exports = router;
