import express from 'express';
import { 
    redirectToSpotify, 
    handleSpotifyCallback, 
    refreshAccessToken 
} from '../controllers/spotifyController.js'; 
import { 
    saveTracks ,
    getUserTracks
} from '../controllers/trackController.js'; 


const router = express.Router();

// Route for redirecting to Spotify authorization page
router.get('/auth', redirectToSpotify);

// Route for handling Spotify's callback after user login
router.get('/callback', handleSpotifyCallback);

// Route for refreshing the access token
router.post('/refresh-token', refreshAccessToken);

// Route for storing tracks in DB
router.post('/save-tracks', saveTracks);

// Route for retrieving tracks in DB
router.get('/get-tracks/:userId', getUserTracks);

export default router;
