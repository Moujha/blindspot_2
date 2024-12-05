const express = require('express');
const path = require('path');
const axios = require('axios'); // To make HTTP requests
const querystring = require('querystring');

const app = express();

// Spotify credentials
// Access environment variables
require('dotenv').config(); // Load .env variables

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

// Middleware for serving static files from the 'src' folder
app.use(express.static(path.join(__dirname, '../src')));
app.use('/assets', express.static(path.join(__dirname, '../assets'))); // Serve 'assets' folder content

// Middleware to handle JSON requests
app.use(express.json());

// Middleware for handling CORS (Cross-Origin Resource Sharing) if needed
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.get('/callback', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});


// Define your `/server` route
app.get('/server', (req, res, next) => {
    res.send('Server deployed'); // Responds with the message
});

// Define `/api/token` endpoint to exchange authorization code for access token
app.post('/api/token', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
        // Exchange the authorization code for an access token
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Send the access token back to the frontend
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error exchanging authorization code for token:', error.response.data);
        res.status(500).json({ error: 'Failed to exchange authorization code for token' });
    }
});

// Fallback for undefined routes
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

// Export the app
module.exports = app;
