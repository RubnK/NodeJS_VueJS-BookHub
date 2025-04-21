const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');

router.get('/book/:bookId', async (req, res) => {
  const { bookId } = req.params;
  const { rows } = await pool.query(
    `SELECT r.*, u.name FROM reviews r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.book_id = $1 ORDER BY r.created_at DESC`,
    [bookId]
  );
  res.json(rows);
});

router.post('/', verifyToken, async (req, res) => {
  const { book_id, rating, comment } = req.body;
  await pool.query(
    'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES ($1, $2, $3, $4)',
    [req.user.id, book_id, rating, comment]
  );
  res.status(201).json({ message: 'Review submitted' });
});

module.exports = router;