const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const booksRouter = require('./routes/books');

const app = express();
const port = 3000;

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'Admin123',
  port: 5432,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.use('/books', (req, res, next) => {
  req.pool = pool; // Pass the pool to the router
  next();
}, booksRouter);

app.get('/', (req, res) => {
  res.redirect('/books');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
