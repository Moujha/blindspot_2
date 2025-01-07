import express from 'express';
import { discoverArtist } from '../controllers/artistCardController.js'; // Import controller


const router = express.Router();

// Route to handle artist discovery
router.post('/discover', discoverArtist);

export default router;
