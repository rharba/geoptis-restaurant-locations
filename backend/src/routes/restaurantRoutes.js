const express = require('express');
const pool = require('../db/database');
const { createRestaurant } = require('../controllers/restaurantController');

const router = express.Router();

// POST - Create a restaurant
router.post('/', createRestaurant);

// GET - Get all restaurants
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM restaurants ORDER BY id ASC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching restaurants:', error);

    res.status(500).json({
      error: 'Unable to fetch restaurants',
    });
  }
});

// GET - Search restaurants by name or address
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        error: 'Search term is required',
      });
    }

    const searchTerm = `%${q.trim()}%`;

    const result = await pool.query(
      `SELECT * FROM restaurants
       WHERE name ILIKE $1
          OR address ILIKE $1
       ORDER BY id ASC`,
      [searchTerm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching restaurants:', error);

    res.status(500).json({
      error: 'Unable to search restaurants',
    });
  }
});

// GET - Filter restaurants by cuisine
router.get('/filter', async (req, res) => {
  try {
    const { cuisine } = req.query;

    if (!cuisine || cuisine.trim() === '') {
      return res.status(400).json({
        error: 'Cuisine is required',
      });
    }

    const result = await pool.query(
      `SELECT * FROM restaurants
       WHERE cuisine_type = $1
       ORDER BY id ASC`,
      [cuisine.trim()]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error filtering restaurants:', error);

    res.status(500).json({
      error: 'Unable to filter restaurants',
    });
  }
});

module.exports = router;