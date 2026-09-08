const pool = require('../db/database');

const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      cuisine_type,
      phone_number,
    } = req.body;

    // Server-side validation
    if (latitude === undefined || latitude === null || latitude === '') {
      return res.status(400).json({
        error: 'La latitude est obligatoire.',
      });
    }

    if (Number(latitude) < -90 || Number(latitude) > 90) {
      return res.status(400).json({
        error: 'La latitude doit être comprise entre -90 et 90.',
      });
    }

    if (longitude === undefined || longitude === null || longitude === '') {
      return res.status(400).json({
        error: 'La longitude est obligatoire.',
      });
    }

    if (Number(longitude) < -180 || Number(longitude) > 180) {
      return res.status(400).json({
        error: 'La longitude doit être comprise entre -180 et 180.',
      });
    }

    const result = await pool.query(
      `INSERT INTO restaurants
       (name, address, latitude, longitude, cuisine_type, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        address,
        latitude,
        longitude,
        cuisine_type,
        phone_number || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating restaurant:', error);

    res.status(500).json({
      error: 'Unable to create restaurant',
    });
  }
};

module.exports = {
  createRestaurant,
};