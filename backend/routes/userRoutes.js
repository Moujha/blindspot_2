const express = require('express');
const router = express.Router();

// Dummy user data (replace with database query later)
const users = [
    { id: 1, name: 'Alice', collectionSize: 25 },
    { id: 2, name: 'Bob', collectionSize: 30 },
    { id: 3, name: 'Charlie', collectionSize: 15 },
  ];
  
  // Route to get all users
  router.get('/', (req, res) => {
    res.json(users); // Send user data as JSON
  });
  
  module.exports = router;