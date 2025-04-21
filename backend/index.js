const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const booksRoutes = require('./routes/books');
const authorsRoutes = require('./routes/auth');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());

app.use('/books', booksRoutes);
app.use('/authors', authorsRoutes);
app.use('/', authRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
