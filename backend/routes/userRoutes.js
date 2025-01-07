import express from 'express';
const router = express.Router();
import { savePseudo, getUserList } from '../controllers/userController.js'; // Import the controller

// Route to save the pseudo
router.post('/save', savePseudo);

// Route to fetch the user list
router.get('/', getUserList);

export default router;
