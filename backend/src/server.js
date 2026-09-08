const express = require('express');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();
const PORT = 3000;

// Allow requests from the Vue frontend
app.use(cors());

// Allow Express to read JSON from requests
app.use(express.json());

// Restaurant API routes
app.use('/api/restaurants', restaurantRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Geoptis Restaurant API is running!',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});