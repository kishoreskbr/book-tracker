const express = require('express');
const router = express.Router();
const axios = require('../axiosInstance'); // Use the custom Axios instance

// GET all books
router.get('/', async (req, res, next) => {
  try {
    const result = await req.pool.query('SELECT * FROM books ORDER BY date_read DESC');
    res.render('index', { books: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET form to add a new book
router.get('/new', (req, res) => {
  res.render('new');
});

// POST a new book
router.post('/', async (req, res) => {
    try {
      const { title, author, rating, review, isbn, date_read } = req.body;
      
      // Fetch the book cover from the Open Library Covers API
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  
      // Insert the new book into the database
      const result = await req.pool.query(
        'INSERT INTO books (title, author, rating, review, cover_url, date_read) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, author, rating, review, coverUrl, date_read]
      );
      
      res.redirect('/books');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

// GET form to edit a book
router.get('/:id/edit', async (req, res, next) => {
  try {
    const result = await req.pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    res.render('edit', { book: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST updated book information
router.post('/:id', async (req, res, next) => {
  const { title, author, rating, review, isbn, date_read } = req.body;
  try {
    const coverResponse = await axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
    const cover_url = coverResponse.config.url;
    await req.pool.query(
      'UPDATE books SET title = $1, author = $2, rating = $3, review = $4, cover_url = $5, date_read = $6 WHERE id = $7',
      [title, author, rating, review, cover_url, date_read, req.params.id]
    );
    res.redirect('/books');
  } catch (err) {
    next(err);
  }
});

// DELETE a book
router.post('/:id/delete', async (req, res, next) => {
  try {
    await req.pool.query('DELETE FROM books WHERE id = $1', [req.params.id]);
    res.redirect('/books');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
