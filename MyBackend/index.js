const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// PostgreSQL bağlantı ayarları
const pool = new Pool({
  user: 'postrgres',
  host: 'localhost',
  database: 'postrgres',
  password: '12345',
  port: 5432,
});

// Basit bir GET endpoint'i
app.get('/api/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM your_table');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});