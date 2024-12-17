const express = require('express');
const { 
    redirectToSpotify, 
    handleSpotifyCallback, 
    refreshAccessToken 
} = require('../controllers/spotifyController');
const { saveTracks } = require('../controllers/trackController'); // New controller for tracks


const router = express.Router();

// Route for redirecting to Spotify authorization page
router.get('/auth', redirectToSpotify);

// Route for handling Spotify's callback after user login
router.get('/callback', handleSpotifyCallback);

// Route for refreshing the access token
router.post('/refresh-token', refreshAccessToken);

// Route for storing tracks in DB
router.post('/save-tracks', saveTracks);

module.exports = router;