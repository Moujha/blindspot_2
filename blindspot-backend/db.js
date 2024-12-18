const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout for connection
    });
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

module.exports = connectDB; // Export the function to use elsewhere
