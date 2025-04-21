const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM books');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.post('/', verifyToken, async (req, res) => {
  const { title, description, publication_date, author_id, genre_id, cover_image } = req.body;
  await pool.query(
    'INSERT INTO books (title, description, publication_date, author_id, genre_id, cover_image) VALUES ($1, $2, $3, $4, $5, $6)',
    [title, description, publication_date, author_id, genre_id, cover_image]
  );
  res.status(201).json({ message: 'Book created' });
});

module.exports = router;