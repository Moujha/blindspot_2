const express = require('express');
const router = express.Router();

const { getUserList } = require('../controllers/userController'); // Import the controller


// Route to fetch the user list
router.get('/', getUserList);

module.exports = router;