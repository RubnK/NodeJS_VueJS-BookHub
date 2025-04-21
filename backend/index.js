const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/authors', require('./routes/authors'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/users', require('./routes/users')); // contient wishlist, favorites, etc.


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
