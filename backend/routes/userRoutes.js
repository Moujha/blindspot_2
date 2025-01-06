const express = require('express');
const router = express.Router();
const { savePseudo, getUserList } = require('../controllers/userController'); // Import the controller

// Route to save the pseudo
router.post('/save', savePseudo);

// Route to fetch the user list
router.get('/', getUserList);

module.exports = router;