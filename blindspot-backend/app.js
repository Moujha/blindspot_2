const express = require('express');
const path = require('path');
require('dotenv').config(); // Load .env variables

const spotifyRoutes = require('./routes/spotifyRoutes'); // Import Spotify routes

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(express.json());

// Middleware for serving static files from the 'src' folder
app.use(express.static(path.join(__dirname, '../src')));
app.use('/assets', express.static(path.join(__dirname, '../assets'))); // Serve 'assets' folder content

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});

// Use Spotify routes
app.use('/spotify', spotifyRoutes); // All Spotify-related routes start with `/spotify`

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/dashboard.html')); // Update the path as per your folder structure
});


// Fallback for undefined routes
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

//When the server starts, you’ll see a list of all the available routes.
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route.path, middleware.route.methods);
    }
});

// Export the app
module.exports = app;
