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

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      address,
      latitude,
      longitude,
      cuisine_type,
      phone_number,
    } = req.body;

    // Server-side validation
    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        error: 'Le nom doit contenir au moins 3 caractères.',
      });
    }

    if (!address || address.trim().length < 10) {
      return res.status(400).json({
        error: "L'adresse doit contenir au moins 10 caractères.",
      });
    }

    if (
      latitude === undefined ||
      latitude === null ||
      latitude === '' ||
      Number(latitude) < -90 ||
      Number(latitude) > 90
    ) {
      return res.status(400).json({
        error: 'La latitude doit être comprise entre -90 et 90.',
      });
    }

    if (
      longitude === undefined ||
      longitude === null ||
      longitude === '' ||
      Number(longitude) < -180 ||
      Number(longitude) > 180
    ) {
      return res.status(400).json({
        error: 'La longitude doit être comprise entre -180 et 180.',
      });
    }

    if (!cuisine_type) {
      return res.status(400).json({
        error: 'La cuisine est obligatoire.',
      });
    }

    const result = await pool.query(
      `UPDATE restaurants
       SET name = $1,
           address = $2,
           latitude = $3,
           longitude = $4,
           cuisine_type = $5,
           phone_number = $6
       WHERE id = $7
       RETURNING *`,
      [
        name.trim(),
        address.trim(),
        Number(latitude),
        Number(longitude),
        cuisine_type,
        phone_number?.trim() || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Restaurant introuvable.',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating restaurant:', error);

    res.status(500).json({
      error: 'Unable to update restaurant',
    });
  }
};

module.exports = {
  createRestaurant,
  updateRestaurant,
};