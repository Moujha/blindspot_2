const express = require('express');
const path = require('path');
const connectDB = require('./db'); // Import MongoDB connection function
const spotifyRoutes = require('./routes/spotifyRoutes'); // Import Spotify routes

require('dotenv').config(); // Load .env variables

const app = express();

// Connect to MongoDB
connectDB(); // Call the function to establish the connection

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Root route serves the main index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '/src/index.html'));
});

// Use Spotify routes
app.use('/spotify', spotifyRoutes);

// Serve additional frontend pages
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'src', 'dashboard.html'));
});

app.get('/cards-preview', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'src', 'cards-preview.html'));
});

// Fallback for undefined routes
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Log all defined routes
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route.path, middleware.route.methods);
    }
});

// Export the app
module.exports = app;
