const express = require('express');
const { discoverArtist } = require('../controllers/artistCardController.js'); // Import controller

const router = express.Router();

// Route to handle artist discovery
router.post('/discover', discoverArtist);

module.exports = router;