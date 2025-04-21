const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');

// Wishlist
router.get('/:id/wishlist', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
  const { rows } = await pool.query(
    'SELECT b.* FROM wishlists w JOIN books b ON w.book_id = b.id WHERE w.user_id = $1',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/:id/wishlist', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
  const { book_id } = req.body;
  await pool.query(
    'INSERT INTO wishlists (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.id, book_id]
  );
  res.status(201).json({ message: 'Book added to wishlist' });
});

router.delete('/:id/wishlist/:bookId', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
  await pool.query(
    'DELETE FROM wishlists WHERE user_id = $1 AND book_id = $2',
    [req.user.id, req.params.bookId]
  );
  res.json({ message: 'Book removed from wishlist' });
});

// Favorites
router.get('/:id/favorites', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
  const { rows } = await pool.query(
    'SELECT b.* FROM favorites f JOIN books b ON f.book_id = b.id WHERE f.user_id = $1',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/:id/favorites', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
  const { book_id } = req.body;
  await pool.query(
    'INSERT INTO favorites (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.id, book_id]
  );
  res.status(201).json({ message: 'Book added to favorites' });
});

router.delete('/:id/favorites/:bookId', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
  await pool.query(
    'DELETE FROM favorites WHERE user_id = $1 AND book_id = $2',
    [req.user.id, req.params.bookId]
  );
  res.json({ message: 'Book removed from favorites' });
});

// Reading status
router.get('/:id/reading-status', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
  const { rows } = await pool.query(
    `SELECT b.*, r.status FROM reading_status r 
     JOIN books b ON r.book_id = b.id 
     WHERE r.user_id = $1`,
    [req.user.id]
  );
  res.json(rows);
});

router.put('/:id/reading-status/:bookId', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
  const { status } = req.body;
  await pool.query(
    `INSERT INTO reading_status (user_id, book_id, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, book_id)
     DO UPDATE SET status = $3, updated_at = CURRENT_TIMESTAMP`,
    [req.user.id, req.params.bookId, status]
  );
  res.json({ message: 'Reading status updated' });
});

module.exports = router;