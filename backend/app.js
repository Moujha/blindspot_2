import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; // Required for __dirname in ES Modules
import dotenv from 'dotenv'; // Load .env variables
import connectDB from './db.js'; // Import MongoDB connection function
import spotifyRoutes from './routes/spotifyRoutes.js'; // Import Spotify routes
import userRoutes from './routes/userRoutes.js'; // Import User routes
import artistCardRoutes from './routes/artistCardRoutes.js'; // Import Artist Cards routes

// Initialize dotenv
dotenv.config();

// Calculate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.get('/social', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'src', 'social.html'));
});

// Use Users routes
app.use('/users', userRoutes);

// Serve create-pseudo.html
app.get('/create-pseudo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'src', 'create-pseudo.html'));
  });

app.use('/artist', artistCardRoutes);


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
export default app;
